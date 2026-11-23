// Game state and rules: life, mana, turns, suit bonuses, surges, win/loss.
import { buildDeck, suitBonus } from './cards.js';
import { makeRng, shuffle } from './random.js';

export const MAX_LIFE = 30;
export const MAX_MANA = 10;
export const HAND_SIZE = 5;

export function newFighter(deck, rng) {
  const d = shuffle([...deck], rng);
  const hand = d.splice(0, HAND_SIZE);
  return {
    life: MAX_LIFE, mana: 2, maxMana: 2,
    deck: d, hand, discard: [], lastCard: null, lastSuit: null,
    damageDealt: 0, cardsPlayed: 0,
  };
}

export function newGame(seed) {
  const rng = makeRng(seed);
  const state = {
    seed, rng,
    round: 1,
    phase: 'title', // title | player | foe | won | lost
    you: newFighter(buildDeck(), rng),
    foe: newFighter(buildDeck(), rng),
    playedSuitsThisTurn: [],
    log: [],
    winner: null,
  };
  return state;
}

export function startDuel(state) {
  state.phase = 'player';
  state.log.push({ cls: 'info', text: '⚔️ The duel begins! Kira strikes first.' });
}

export function drawCard(fighter) {
  if (fighter.deck.length === 0) {
    if (fighter.discard.length === 0) return null;
    fighter.deck = shuffle([...fighter.discard], Math.random);
    fighter.discard = [];
  }
  const card = fighter.deck.shift();
  if (card) fighter.hand.push(card);
  return card;
}

// Damage for a card: power + suit bonus vs defender's last suit + surge.
export function strikeDamage(state, attacker, card) {
  const defender = attacker === state.you ? state.foe : state.you;
  let dmg = card.power;
  dmg += suitBonus(card.suit, defender.lastSuit);
  const sameSuit = state.playedSuitsThisTurn.filter((s) => s === card.suit).length;
  dmg += sameSuit; // surge: +1 per earlier same-suit card this turn
  return Math.max(1, dmg);
}

export function playCard(state, side, cardId) {
  const attacker = side === 'you' ? state.you : state.foe;
  const defender = side === 'you' ? state.foe : state.you;
  const idx = attacker.hand.findIndex((c) => c.id === cardId);
  if (idx < 0) return null;
  const card = attacker.hand[idx];
  if (card.cost > attacker.mana) return null;
  attacker.hand.splice(idx, 1);
  attacker.discard.push(card);
  attacker.mana -= card.cost;
  attacker.cardsPlayed += 1;
  const dmg = strikeDamage(state, attacker, card);
  defender.life = Math.max(0, defender.life - dmg);
  attacker.damageDealt += dmg;
  attacker.lastCard = card;
  attacker.lastSuit = card.suit;
  if (side === 'you') state.playedSuitsThisTurn.push(card.suit);
  return { card, dmg };
}

export function checkEnd(state) {
  if (state.foe.life <= 0) { state.phase = 'won'; state.winner = 'you'; return 'won'; }
  if (state.you.life <= 0) { state.phase = 'lost'; state.winner = 'foe'; return 'lost'; }
  return null;
}

export function beginPlayerTurn(state) {
  state.round += 1;
  state.playedSuitsThisTurn = [];
  const you = state.you;
  you.maxMana = Math.min(MAX_MANA, you.maxMana + 1);
  you.mana = you.maxMana;
  drawCard(you);
  state.phase = 'player';
}

export function beginFoeTurn(state) {
  const foe = state.foe;
  foe.maxMana = Math.min(MAX_MANA, foe.maxMana + 1);
  foe.mana = foe.maxMana;
  drawCard(foe);
  state.phase = 'foe';
}

export function scoreTotal(state) {
  return state.you.damageDealt + state.you.cardsPlayed * 5 + (state.winner === 'you' ? 100 : 0);
}
