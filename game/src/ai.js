// Morvain's brain: pick the opponent's plays for the turn.
// Reads the board, counters the player's last suit when it can, and never
// wastes mana on a weak card when a stronger one is affordable.
import { suitBonus } from './cards.js';

export function chooseAiPlays(state) {
  const foe = state.foe;
  const plays = [];
  let mana = foe.mana;
  const hand = [...foe.hand];
  const lastYouSuit = state.you.lastSuit;

  // Score a card: raw power, plus suit advantage vs the player's last card,
  // plus a small nudge for cheap cards early so mana is never left idle.
  function score(card) {
    let s = card.power + suitBonus(card.suit, lastYouSuit);
    s += (5 - card.cost) * 0.15;
    return s;
  }

  hand.sort((a, b) => score(b) - score(a));
  for (const card of hand) {
    if (card.cost <= mana) {
      plays.push(card);
      mana -= card.cost;
    }
  }
  // If nothing affordable was found, hold mana for next turn.
  return plays;
}

// Morvain taunts on a schedule so the duel feels alive.
const TAUNTS = [
  'Morvain grins: "The ash remembers every flame."',
  'Morvain: "Your isles will crumble like old stone."',
  'Morvain: "I have drowned brighter embers than you."',
  'Morvain: "Strike, little guardian. The deep is patient."',
];

export function pickTaunt(round, rng) {
  return TAUNTS[(round + Math.floor(rng() * TAUNTS.length)) % TAUNTS.length];
}
