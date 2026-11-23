[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/faridamaharini-cell/makefun-best-card-game-20261122/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/faridamaharini-cell/makefun-best-card-game-20261122/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

# 🔥 Ember Isles Duel — Clash of the Island Guardians

An original 1-v-1 duel card battler, built for the
[make.fun "Make the best card game" bounty](https://make.fun/bounty/best-card-game-20261122-1826).
Kira, Ember Guardian of the isles, duels Morvain, the Ashen Warden, in a battle of
elemental cards. No network, no build step — just static files that open in desktop Chrome.

## How to play

- **30 Life each** — first to 0 loses.
- **Mana** grows +1 every turn (max 10). Every card costs mana and deals its **Power** as damage.
- **Suit cycle:** 🔥 Flame beats 🍃 Leaf, 🍃 Leaf beats 💧 Tide, 💧 Tide beats 🔥 Flame.
  🪨 Stone stands alone — no bonus, no weakness. Suit advantage: **+2 power**.
- **Surge:** playing two cards of the same suit in one turn gives **+1** to each next one.
- Draw a card every turn, play as many as your mana allows, then end your turn and
  watch Morvain answer — he reads your last suit and counters it when he can.

**Controls:** click a card (or press `1–5`) to play it · `Space` ends your turn ·
`R` restarts · `M` mutes the synthesized sounds.

## Run it

```sh
node serve.ts
# open http://localhost:8080 in desktop Chrome
```

Screenshot states (real renders of the game's own code, seeded):
`?shot=title`, `?shot=battle`, `?shot=win`, `?shot=loss`.

## Layout

- `game/index.html` — the table: both fighters, both hands, log, turn controls
- `game/css/style.css` — table, cards, overlays, animations (all art is CSS + emoji)
- `game/src/cards.js` — the 24-card deck: four original elemental suits
- `game/src/state.js` — rules: life, mana, turns, suit bonuses, surges, win/loss
- `game/src/ai.js` — Morvain's brain: counters your last suit, spends mana wisely
- `game/src/render.js` — DOM rendering, life bars, floating damage, end screens
- `game/src/audio.js` — synthesized WebAudio bleeps (no audio files)
- `game/src/shots.js` — deterministic screenshot states, played by the real rules
- `game/src/random.js` — seeded RNG for fair shuffles and deterministic deals
- `game/src/main.js` — bootstrap, keyboard/mouse input, turn flow
- `main.ts` — entry program: copies `game/` + `screenshots/` to `/output`, writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
