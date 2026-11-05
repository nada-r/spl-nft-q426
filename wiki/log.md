---
title: Log
type: log
updated: 2026-11-06
sources: [../src/addresses.ts]
---

Append-only. One entry for each step. Recent entries:
`grep "^## \[" wiki/log.md | tail -5`

## [2026-11-06] decision | Reuse the Q3 code, run again with the Q4 wallet

The Q3 repo `github.com/nada-r/spl-nft-q326` already does tasks 1 to 3. Its
run used the Q3 wallet `HJyV...96Gb`. This repo copies those scripts and runs
them again with the Q4 wallet `6M3L...GghE` (`~/.config/solana/id.json`).
The extension tasks 4 and 5 are out of scope.

## [2026-11-06] decision | No keypair in the repo, one file for the addresses

`src/config.ts` reads the keypair from `WALLET_PATH`. `src/addresses.ts` holds
each value that a step logs. `spl_init.ts` and `nft_mint.ts` stop if their
value is already recorded, so a second run does not create a second account.

## [2026-11-06] step | Task 1: SPL token

`npm run spl:init`, `spl:metadata`, `spl:mint`, `spl:transfer`, in this order.
Mint `7WAe...PTox`, 6 decimals, mint and freeze authority `6M3L...`.
Signatures: init `4znmrCXB...YQcNF`, metadata `5L9yMHZg...WzLsj`, mint
`2sm1qqo6...MgrS9`, transfer `6ytqupXv...nFMRf`. All four are `Finalized`.
`spl-token display` shows a supply of 100 tokens. The wallet holds 90. The
recipient `AEyX...ZQQA` holds 10.

## [2026-11-06] step | Task 2: MPL Core NFT

`npm run nft:image`: `rug.png` uploaded to Irys devnet. The gateway returns
HTTP 200, `image/png`, and the same bytes as `rug.png`. `npm run nft:metadata`:
JSON with name "Turbin3 Rug", symbol "RUG", cohort "Q4 2026".
`npm run nft:mint`: asset `4bG5...nVf6`, signature `VhGEiYen...WtRXQ6`,
instruction `CreateV2`, `Finalized`. The MPL Core program `CoRE...hX7d` owns
the asset account. Rent: 0.00293764 SOL. `fetchAsset` shows owner and update
authority `6M3L...`.

## [2026-11-06] step | Task 3: update as the update authority

`npm run nft:update`: new JSON with name "Turbin3 Rug v2" and attribute
`version = 2`. Signature `4hccwUuq...RU1Ho`, instruction `UpdateV2`, status Ok,
`Finalized`. The asset rent rose to 0.00295288 SOL for the longer name. The
script printed the old name after the update. See `error.md`. A new read
shows "Turbin3 Rug v2" and the new URI.

## [2026-11-06] step | Tests and cost

`npm test` with node v25.2.1: 8 pass, 0 fail. Each of the 6 transactions is
`Finalized`. The run was from 16:54:22 to 16:58:05 UTC on 2026-11-05. The
wallet balance went from 15.122411254 to 15.101588031 SOL, so the run cost
0.020823223 SOL, with the Irys uploads.
