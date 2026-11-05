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
