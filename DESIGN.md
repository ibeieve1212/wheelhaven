# Wheelhaven design

Status: Active · 2026-11-05

## Purpose and evidence

An original, playable Squeekchain crop strategy game. Players choose crops, manage dew, improve plots, and restore a pantry beacon. This is a game using real wheel activity, not a statistics dashboard.

Primary evidence: https://squeekchain.com/genesis/code, https://api.squeekchain.com/v1/status and https://api.squeekchain.com/v1/economy/state. The Build page requires a useful original product, attribution verification, and team approval. The user has authorized a free domain, public publication and official submission. Complete actual ownership checks before claiming a submission or badge. The Chinese product name is 仓鼠粮仓; the English subtitle is Hamster Pantry. Planting areas are 食材田 / food patches.

## Interaction contract

- One planting experience: growth comes only from new, fresh, hardware-provenance accepted wheel passages reported by the official status API. The settled round supplies a deterministic in-game season. Explain that sensor readings and settled records are different stages.
- No mode switch or simulated-step controls. Existing real-wheel saves stay compatible; old practice saves are not loaded or imported into this experience.
- No wallet connection, token spending, betting, or monetary rewards.
- A pantry has nine plots, four initially unlocked; three crop types; watering; harvests; plot expansion; and three persistent improvements. The beacon is the win condition.
- Finite resources, meaningful crop timing/yield choices, and an emergency seed prevent a permanent soft lock.
- Counter reset/installation change reanchors without inventing work. Stale, invalid, and disconnected samples cannot grow plants.
- Local browser saves, portable JSON save export/import, and explicit reset confirmation. Imported saves are validated and reconstructed from a small allowlist.

## Visual direction

The user's crop direction is hamster-food plants: carrots, broccoli and sunflowers harvested for their seeds. All plant illustrations, seeds, descriptions, history, help text and portable-save migration use that theme consistently.

Quiet botanical storybook: warm paper, deep forest ink, sage crop beds, golden harvests and coral accents. Large editorial serif headline paired with a clear system sans-serif. Original inline SVG crops, hamster wheel and food-patch scenery. No external fonts, raster assets or animation libraries.

The food patch is the main interactive surface. The seed tray sits to its right on wide screens and below it on phones. The wheel status explains whether crops are growing or resting. Technical provenance belongs in an optional evidence panel, not the main game flow.

## Accessibility and responsive behavior

Semantic buttons and native dialogs, visible focus, labelled plots, keyboard-accessible planting and harvesting, polite outcome announcements, status text in addition to colour. Touch targets at least 44 px. Respect reduced motion. Three plot columns remain visible on a 375 px phone. English and Chinese UI, with language persisted locally.

## Validation

Pure engine tests cover resource invariants, real-counter progression, duplicate/stale samples, resets and epochs, mode isolation, save validation, and a complete practice-game win. Browser QA covers a complete plant/harvest/improvement flow, dialogs, English/Chinese switching, persistence, and a phone layout. Live API integration must be checked against the current schema rather than hard-coded contract addresses.
