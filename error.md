# Errors

Each error with its cause and its fix.

## 2026-11-06 - `npm run nft:update`: the read after the update shows the old name

- Command: `npm run nft:update`
- Symptom: the script printed `update txid: 4hccwUuq...`, then
  `updated name: Turbin3 Rug` and the old URI.
- Check: `solana confirm -v 4hccwUuq... -ud` shows `UpdateV2`, status Ok,
  `Finalized`. The instruction data contains "Turbin3 Rug v2" and the new URI.
  A new `fetchAsset` shows the new values. The write was correct. Only the read
  was old.
- Cause: the scripts called `createUmi(RPC_URL)` with no commitment. Umi then
  creates the web3.js `Connection` with no commitment.
  - The confirm: `confirmTransaction` polls the signature status. With no
    commitment, the `switch (commitment)` in web3.js has no matching case, so
    it accepts a `processed` status.
  - The read: `getAccountInfo` sends no commitment, so the RPC server uses its
    default, `finalized`.
  - So the script can read before the update is finalized.
- Fix: `createUmi(RPC_URL, { commitment: "confirmed" })` in every script and in
  the test. The confirm and the read then use `confirmed`. A runtime check
  prints `connection commitment: confirmed`. The fix was not run again on
  devnet, to keep one update transaction for the proof.

## 2026-11-06 - `npm`: node v16 comes first in the tool shell PATH

- Command: `node --version` in a non-interactive shell
- Symptom: `v16.14.2` from `/usr/local/bin/node`. `pnpm` fails with
  "requires at least Node.js v18.12".
- Cause: `/usr/local/bin` comes before `~/.asdf/shims` in that shell.
  `~/.tool-versions` pins nodejs 25.2.1.
- Fix: `export PATH="$HOME/.asdf/shims:$PATH"` before each npm command.

## 2026-11-06 - `npm run nft:*`: "bigint: Failed to load bindings"

- Command: each script that loads Umi
- Symptom: `bigint: Failed to load bindings, pure JS will be used (try npm run rebuild?)`
- Cause: the `bigint-buffer` package has no native build. It uses the pure
  JavaScript code.
- Fix: none needed. The scripts give the correct result. This is a warning.
