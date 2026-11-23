// Deterministic screenshot states: real games, played by the real rules,
// with fixed seeds so every screenshot is a true render of the game's code.
// ?shot=title | battle | win | loss  (default: title)
import { newGame, startDuel, playCard, checkEnd, beginPlayerTurn, beginFoeTurn } from './state.js';
import { chooseAiPlays } from './ai.js';
import { suitBonus, cardLabel } from './cards.js';

// Player policy used by scripted games: best damage per mana first.
function playerPolicy(state) {
  const you = state.you;
  const foeSuit = state.foe.lastSuit;
  const affordable = you.hand.filter((c) => c.cost <= you.mana);
  affordable.sort((a, b) =>
    (b.power + suitBonus(b.suit, foeSuit)) / b.cost - (a.power + suitBonus(a.suit, foeSuit)) / a.cost);
  return affordable[0] || null;
}

function playPlayerTurn(state) {
  let card;
  while ((card = playerPolicy(state))) {
    const res = playCard(state, 'you', card.id);
    state.log.push({ cls: 'good', text: `You play ${cardLabel(card)} — ${res.dmg} damage!` });
    if (checkEnd(state)) return;
  }
}

function playFoeTurn(state) {
  for (const card of chooseAiPlays(state)) {
    const res = playCard(state, 'foe', card.id);
    if (!res) continue;
    state.log.push({ cls: 'bad', text: `Morvain plays ${cardLabel(card)} — ${res.dmg} damage!` });
    if (checkEnd(state)) return;
  }
}

// Run a whole game with the real rules until someone wins (max 60 rounds).
export function simulateFullGame(seed) {
  const state = newGame(seed);
  startDuel(state);
  for (let turn = 0; turn < 60; turn++) {
    playPlayerTurn(state);
    if (checkEnd(state)) return state;
    beginFoeTurn(state);
    playFoeTurn(state);
    if (checkEnd(state)) return state;
    beginPlayerTurn(state);
  }
  return state;
}

function findEnding(want) {
  for (let seed = 1; seed <= 300; seed++) {
    const state = simulateFullGame(seed);
    if (state.phase === want) return state;
  }
  // Fallback: a long duel always ends one way; return the closest game.
  return simulateFullGame(42);
}

function buildBattle() {
  // Pick a seed whose mid-game looks alive: both guardians still standing,
  // mana to spend, and at least one card affordable right now. Try a
  // 2-round duel first (tighter, livelier board), then a 3-round one.
  for (const rounds of [2, 3]) {
    for (let seed = 1; seed <= 400; seed++) {
      const state = newGame(seed);
      startDuel(state);
      for (let r = 0; r < rounds; r++) {
        playPlayerTurn(state);
        if (checkEnd(state)) break;
        beginFoeTurn(state);
        playFoeTurn(state);
        if (checkEnd(state)) break;
        beginPlayerTurn(state);
      }
      if (state.phase === 'won' || state.phase === 'lost') continue;
      const card = playerPolicy(state);
      if (card) {
        const res = playCard(state, 'you', card.id);
        state.log.push({ cls: 'good', text: `You play ${cardLabel(card)} — ${res.dmg} damage!` });
        checkEnd(state);
      }
      if (state.phase === 'won' || state.phase === 'lost') continue;
      const balanced = state.you.life >= 12 && state.foe.life >= 10
        && state.you.mana >= 2 && state.you.hand.length >= 4
        && state.you.hand.some((c) => c.cost <= state.you.mana);
      if (balanced) {
        state.log.push({ cls: 'info', text: 'Your move — pick a card and strike!' });
        return state;
      }
    }
  }
  // Fallback: the first seed's game, whatever it looks like.
  const state = newGame(20261123);
  startDuel(state);
  playPlayerTurn(state);
  beginFoeTurn(state);
  playFoeTurn(state);
  beginPlayerTurn(state);
  return state;
}

export function setupShot(shot) {
  if (shot === 'battle') return buildBattle();
  if (shot === 'win') return findEnding('won');
  if (shot === 'loss') return findEnding('lost');
  return newGame(7); // title
}
