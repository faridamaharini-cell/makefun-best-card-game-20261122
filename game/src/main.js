// Bootstrap: wires input, turns, overlays and the ?shot= screenshot states.
import { newGame, startDuel, playCard, checkEnd, beginPlayerTurn, beginFoeTurn } from './state.js';
import { chooseAiPlays, pickTaunt } from './ai.js';
import { cardLabel } from './cards.js';
import { renderAll, pushLog, floatDamage, shakeFighter, showEnd, hideOverlays, setStatus } from './render.js';
import { playSound, setMuted, isMuted } from './audio.js';
import { setupShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') || '20261123', 10);

let state;
let ui;

function freshState() {
  return shot ? setupShot(shot) : newGame(Number.isFinite(seedParam) ? seedParam : 20261123);
}

function refresh(clashLine) {
  ui.clashLine = clashLine;
  renderAll(state, ui);
}

function endIfOver() {
  const end = checkEnd(state);
  if (!end) return false;
  refresh();
  playSound(end === 'won' ? 'win' : 'lose');
  setTimeout(() => showEnd(state), 650);
  setStatus(end === 'won' ? 'Victory! You won the duel.' : 'Defeat. Morvain won the duel.');
  return true;
}

function doPlayCard(cardId) {
  if (state.phase !== 'player') return;
  const card = state.you.hand.find((c) => c.id === cardId);
  if (!card) return;
  if (card.cost > state.you.mana) {
    playSound('error');
    pushLog(state, 'info', `Not enough mana for ${card.name} (needs ◆${card.cost}).`);
    refresh('Not enough mana — end your turn or play a cheaper card.');
    return;
  }
  const res = playCard(state, 'you', cardId);
  playSound('play');
  playSound('hit');
  floatDamage('.fighter.foe', `-${res.dmg}`);
  shakeFighter('foe');
  pushLog(state, 'good', `You play ${cardLabel(card)} — ${res.dmg} damage!`);
  setStatus(`You played ${card.name} for ${res.dmg} damage.`);
  if (endIfOver()) return;
  refresh();
}

function endTurn() {
  if (state.phase !== 'player') return;
  playSound('turn');
  beginFoeTurn(state);
  pushLog(state, 'info', pickTaunt(state.round, state.rng));
  refresh("Morvain's turn…");
  // Morvain plays with a beat between cards so the table reads clearly.
  const plays = chooseAiPlays(state);
  let i = 0;
  const step = () => {
    if (state.phase !== 'foe') return;
    if (i >= plays.length) {
      beginPlayerTurn(state);
      playSound('draw');
      pushLog(state, 'info', `Round ${state.round} — you draw a card, mana ◆${state.you.mana}.`);
      refresh();
      return;
    }
    const card = plays[i++];
    const res = playCard(state, 'foe', card.id);
    if (res) {
      playSound('hit');
      floatDamage('.fighter.you', `-${res.dmg}`);
      shakeFighter('you');
      pushLog(state, 'bad', `Morvain plays ${cardLabel(card)} — ${res.dmg} damage!`);
      refresh();
      if (endIfOver()) return;
    }
    setTimeout(step, 650);
  };
  setTimeout(step, 500);
}

function startGame() {
  hideOverlays();
  state = newGame((Date.now() % 100000) + 7);
  startDuel(state);
  playSound('turn');
  refresh('Your turn — play a card to strike!');
  setStatus('The duel begins. Your turn.');
}

function bindButtons() {
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('againBtn').addEventListener('click', startGame);
  document.getElementById('endTurnBtn').addEventListener('click', endTurn);
  document.getElementById('restartBtn').addEventListener('click', () => {
    hideOverlays();
    state = newGame((Date.now() % 100000) + 7);
    startDuel(state);
    refresh('Fresh duel — your turn!');
  });
  document.getElementById('muteBtn').addEventListener('click', (e) => {
    const m = setMuted(!isMuted());
    e.currentTarget.textContent = m ? '🔇 MUTED' : '🔊 SOUND';
  });
}

function bindKeys() {
  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '5') {
      const card = state.you.hand[Number(e.key) - 1];
      if (card) doPlayCard(card.id);
    } else if (e.key === ' ' || e.key === 'Enter') {
      if (state.phase === 'player') { e.preventDefault(); endTurn(); }
      else if (state.phase === 'title') startGame();
      else if (state.phase === 'won' || state.phase === 'lost') startGame();
    } else if (e.key === 'r' || e.key === 'R') {
      hideOverlays();
      state = newGame((Date.now() % 100000) + 7);
      startDuel(state);
      refresh('Fresh duel — your turn!');
    } else if (e.key === 'm' || e.key === 'M') {
      const m = setMuted(!isMuted());
      document.getElementById('muteBtn').textContent = m ? '🔇 MUTED' : '🔊 SOUND';
    }
  });
}

function boot() {
  ui = { clashLine: '', onPlayCard: (id) => doPlayCard(id) };
  state = freshState();
  bindButtons();
  bindKeys();
  // Read-only handle for play-testing: window.__emberDuel.state() returns
  // the live game state; the game itself never reads it.
  window.__emberDuel = { state: () => state };
  if (shot) {
    // Screenshot mode: hide the title overlay for battle/win/loss shots,
    // show the end overlay for finished games.
    if (shot === 'battle') hideOverlays();
    if (state.phase === 'won' || state.phase === 'lost') {
      hideOverlays();
      renderAll(state, ui);
      showEnd(state);
    } else {
      renderAll(state, ui);
    }
    document.title = `Ember Isles Duel — shot: ${shot}`;
  } else {
    renderAll(state, ui);
  }
}

boot();
