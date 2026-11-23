// DOM rendering: hands, life bars, mana, log, banners, overlays, floating damage.
import { SUITS } from './cards.js';
import { MAX_LIFE, scoreTotal } from './state.js';

const $ = (id) => document.getElementById(id);

export function cardElement(card, opts = {}) {
  const el = document.createElement('div');
  el.className = `card ${card.suit}${opts.unplayable ? ' unplayable' : ''}`;
  el.dataset.cardId = String(card.id);
  const suit = SUITS[card.suit];
  el.innerHTML =
    `<div class="cost">◆${card.cost}</div>` +
    `<div class="suit">${suit.icon}</div>` +
    `<div class="cname">${card.name}</div>` +
    `<div class="power">⚔️ ${card.power}</div>` +
    `<div class="power-label">${suit.name.toUpperCase()}</div>` +
    (opts.keyLabel ? `<div class="key">[${opts.keyLabel}]</div>` : '');
  return el;
}

export function cardBackElement() {
  const el = document.createElement('div');
  el.className = 'card-back';
  el.textContent = '🌋';
  return el;
}

export function renderAll(state, ui) {
  renderFighter(state, 'you');
  renderFighter(state, 'foe');
  renderHands(state, ui);
  renderLog(state);
  $('roundLabel').textContent = `ROUND ${state.round}`;
  $('scoreLabel').textContent = `SCORE ${scoreTotal(state)}`;
  const banner = $('turnBanner');
  if (state.phase === 'player') { banner.textContent = 'YOUR TURN'; banner.classList.remove('foe-turn'); }
  else if (state.phase === 'foe') { banner.textContent = "MORVAIN'S TURN"; banner.classList.add('foe-turn'); }
  else if (state.phase === 'won') { banner.textContent = 'VICTORY!'; banner.classList.remove('foe-turn'); }
  else if (state.phase === 'lost') { banner.textContent = 'DEFEAT'; banner.classList.add('foe-turn'); }
  $('endTurnBtn').disabled = state.phase !== 'player';
  $('clashLine').textContent = ui.clashLine || defaultClash(state);
}

function defaultClash(state) {
  if (state.phase === 'player') return 'Play a card to strike — suit advantage +2, surge +1!';
  if (state.phase === 'foe') return 'Morvain is plotting his strike…';
  if (state.phase === 'won') return 'The Ember Isles are safe — for now.';
  if (state.phase === 'lost') return 'The ash claims another guardian…';
  return 'Play a card to strike!';
}

function renderFighter(state, side) {
  const f = state[side];
  const prefix = side === 'you' ? 'you' : 'foe';
  $(`${prefix}LifeFill`).style.width = `${(f.life / MAX_LIFE) * 100}%`;
  $(`${prefix}LifeText`).textContent = `${f.life} / ${MAX_LIFE}`;
  $(`${prefix}ManaText`).textContent = `◆ ${f.mana} / ${f.maxMana}`;
  $(`${prefix}DeckText`).textContent = `DECK ${f.deck.length}`;
  const last = $(`${prefix}LastPlay`);
  last.textContent = f.lastCard
    ? `Last: ${f.lastCard.name} ⚔️${f.lastCard.power}`
    : '—';
}

function renderHands(state, ui) {
  const youHand = $('youHand');
  youHand.replaceChildren();
  state.you.hand.forEach((card, i) => {
    const unplayable = state.phase !== 'player' || card.cost > state.you.mana;
    const el = cardElement(card, { unplayable, keyLabel: String(i + 1) });
    el.addEventListener('click', () => ui.onPlayCard(card.id, el));
    youHand.appendChild(el);
  });
  const foeHand = $('foeHand');
  foeHand.replaceChildren();
  state.foe.hand.forEach(() => foeHand.appendChild(cardBackElement()));
}

function renderLog(state) {
  const log = $('battleLog');
  log.replaceChildren();
  for (const entry of state.log.slice(-5)) {
    const div = document.createElement('div');
    div.className = entry.cls;
    div.textContent = entry.text;
    log.appendChild(div);
  }
  log.scrollTop = log.scrollHeight;
}

export function pushLog(state, cls, text) {
  state.log.push({ cls, text });
  renderLog(state);
}

export function floatDamage(targetSelector, text, heal = false) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = `float-dmg${heal ? ' heal' : ''}`;
  el.textContent = text;
  el.style.left = `${rect.left + rect.width / 2 - 30}px`;
  el.style.top = `${rect.top + 10}px`;
  $('floatLayer').appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

export function shakeFighter(side) {
  const el = document.querySelector(side === 'you' ? '.fighter.you' : '.fighter.foe');
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

export function showEnd(state) {
  const screen = $('endScreen');
  const card = screen.querySelector('.end-card');
  const won = state.phase === 'won';
  card.classList.toggle('win', won);
  card.classList.toggle('lose', !won);
  $('endEmoji').textContent = won ? '🏆' : '🌋';
  $('endTitle').textContent = won ? 'VICTORY!' : 'DEFEAT';
  $('endSub').textContent = won
    ? 'Kira shatters Morvain’s ash-crown — the Ember Isles burn bright again!'
    : 'Morvain’s ash swallows the last ember… but a guardian always rises again.';
  const stats = [
    [state.you.damageDealt, 'DAMAGE DEALT'],
    [state.you.cardsPlayed, 'CARDS PLAYED'],
    [state.round, 'ROUNDS'],
    [scoreTotal(state), 'FINAL SCORE'],
  ];
  $('endStats').replaceChildren(...stats.map(([v, label]) => {
    const d = document.createElement('div');
    d.className = 'stat';
    d.innerHTML = `<b>${v}</b><span>${label}</span>`;
    return d;
  }));
  screen.classList.remove('hidden');
}

export function hideOverlays() {
  $('titleScreen').classList.add('hidden');
  $('endScreen').classList.add('hidden');
}

export function setStatus(text) {
  $('status').textContent = text;
}
