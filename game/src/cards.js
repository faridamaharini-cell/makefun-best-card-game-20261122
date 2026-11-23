// Card catalogue for Ember Isles Duel — original names, four elemental suits.
// Suits: flame, tide, leaf, stone. Cost = mana to play. Power = base damage.
// Suit cycle: flame beats leaf, leaf beats tide, tide beats flame. Stone is neutral.
export const SUITS = {
  flame: { name: 'Flame', icon: '🔥', color: '#ff8a3c', beats: 'leaf' },
  tide: { name: 'Tide', icon: '💧', color: '#3fa9f5', beats: 'flame' },
  leaf: { name: 'Leaf', icon: '🍃', color: '#5ecf6a', beats: 'tide' },
  stone: { name: 'Stone', icon: '🪨', color: '#d8b25e', beats: null },
};

export function suitBonus(attackSuit, defendSuit) {
  if (!attackSuit || !defendSuit) return 0;
  if (SUITS[attackSuit].beats === defendSuit) return 2;
  if (SUITS[defendSuit].beats === attackSuit) return -2;
  return 0;
}

// One entry per card in a 24-card deck: [name, suit, cost, power]
const DECK_LIST = [
  ['Ember Imp', 'flame', 1, 2],
  ['Spark Fox', 'flame', 1, 3],
  ['Cinder Hawk', 'flame', 2, 4],
  ['Magma Drake', 'flame', 4, 8],
  ['Blaze Panther', 'flame', 3, 6],
  ['Ash Sprite', 'flame', 2, 3],
  ['Tide Serpent', 'tide', 2, 4],
  ['Coral Knight', 'tide', 3, 5],
  ['Pearl Whale', 'tide', 5, 9],
  ['Rain Heron', 'tide', 1, 2],
  ['Foam Otter', 'tide', 1, 3],
  ['Storm Eel', 'tide', 3, 6],
  ['Thorn Wolf', 'leaf', 2, 4],
  ['Moss Bear', 'leaf', 3, 5],
  ['Vine Viper', 'leaf', 1, 2],
  ['Ancient Oak', 'leaf', 5, 9],
  ['Fern Falcon', 'leaf', 2, 3],
  ['Bloom Stag', 'leaf', 4, 7],
  ['Boulder Titan', 'stone', 4, 8],
  ['Pebble Crab', 'stone', 1, 2],
  ['Granite Golem', 'stone', 3, 6],
  ['Crystal Lynx', 'stone', 2, 4],
  ['Quarry Ox', 'stone', 2, 3],
  ['Obsidian Bat', 'stone', 3, 5],
];

let nextCardId = 1;

export function buildCard(def) {
  const [name, suit, cost, power] = def;
  return { id: nextCardId++, name, suit, cost, power };
}

export function buildDeck() {
  return DECK_LIST.map(buildCard);
}

export function cardLabel(card) {
  return `${card.name} (${SUITS[card.suit].name} ${card.power})`;
}
