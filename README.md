# Wheelhaven · 仓鼠粮仓

An original crop strategy game for the Squeekchain ecosystem. A real hamster's accepted wheel passages grow carrots, broccoli and sunflower seeds for a hamster-themed pantry. Players choose crops, manage dew, water plants, expand plots, restore the watermill and seed library, and light a beacon to complete the game.

## Run

Node.js 18 or later. No dependency installation or build step is needed.

```sh
npm start
```

Open the printed `http://127.0.0.1:4317/` URL. Production hosting can serve `dist/` on any static host. The first-party Sites manifest configures hosting; the hosting URL itself is not a Genesis domain verification.

## Play

1. Choose Carrot or Broccoli, then tap an empty plot.
2. All plants advance only when fresh accepted sensor passages increase. There is one planting experience, driven by the real hamster. Crops pause while the hamster rests.
3. Water once to reduce a crop's passage requirement by 30%.
4. Harvest crops for dew. Restore the watermill for +1 yield, the seed library for sunflower seeds, and the beacon to finish.
5. Expand plots to grow more crops at once. If dew runs out and all food patches are empty, an emergency seed prevents a permanent soft lock.

English and Chinese are available. Local browser saves can be exported and imported. Existing real-wheel saves remain compatible; the UI does not load or import old practice saves. This is a local, noncompetitive game: saves are portable, editable files, not authenticated on-chain achievements.

## Squeekchain integration

- `https://api.squeekchain.com/v1/status`: `measurement.cumulativeWorkUnits`, `counterEpoch`, hardware provenance, observed/received timestamps, freshness and wheel RPM.
- `https://api.squeekchain.com/v1/economy/state`: schema 3, matching installation and Sepolia chain ID; `mining.processedThroughRound` rotates an in-game crop bonus. The active future round is not presented as settled history.
- Refreshes every 15 seconds with request deadlines. Disconnected, stale, future-dated and invalid samples do not add growth. Counter resets and installation changes reanchor without granting a jump. Out-of-order samples do not rewind the counter.
- All counter arithmetic uses bigint before a bounded per-plant conversion. No contract addresses are hard-coded.
- Growth represents accepted sensor activity, not settled on-chain rewards. The evidence panel exposes that distinction and links the official sources.
- No wallet connection, signatures, purchases, bets or tokens. All dew and harvests are in-game objects.

## Check

```sh
npm test
node test/check-live.mjs
```

The engine tests include a complete game win using an isolated simulation helper, resource constraints, stale/replayed samples, epoch changes, watering and save validation. The simulation helper is not exposed by the application. The live check calls the official endpoints and therefore needs network access and a healthy fresh feed.

## Files

- `dist/game.mjs`: pure crop rules and telemetry validation.
- `dist/app.mjs`: UI, bilingual copy, live feed and local saves.
- `dist/art.mjs`: original vector crop, hamster wheel and building artwork.
- `dist/styles.css`, `dist/index.html`: responsive, keyboard-accessible game.
- `test/`: meaningful engine and integration checks.
- `server.mjs`: local-only static preview server.

## Submission status

The working project can be prepared for Genesis direct submission. A team-approved badge is not guaranteed. The owner still needs an eligible custom domain, a publicly reviewable source repository, the exact DNS/page verification challenge from Genesis, and team approval. Do not substitute a shared hosting hostname or a fabricated ownership token.

Created by FLau1212 with development assistance from Codex. Independent of Squeekchain. The hamster imagery and game artwork here are original SVG illustrations, not copies of Squeekchain NFT art.

## License

MIT. See `LICENSE`.
