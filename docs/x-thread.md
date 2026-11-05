# X thread draft

This is a draft for X. Post each block below as one post, in order. A script
checked each post: each post is under 280 characters, with a link counted as
23 characters. Add the Turbin3 account tag if you want. After you post, add the
link of the first post to the submission.

---

1/

Week 1 of Turbin3 Q4 2026: I created my own SPL token, minted an NFT with Metaplex Core, then changed the NFT's name and metadata as its update authority.

All on Solana devnet, with tests that read the chain state.

What I did and what I learned 🧵

---

2/

Task 1, the token. A Solana token is a mint account: supply, decimals, mint authority.

Your balance isn't in your wallet. It sits in a token account derived from your wallet and the mint (the ATA).

So "mint 100, send 10" = my ATA + mintTo, then their ATA + transfer.

---

3/

I used transferChecked, not plain transfer. The caller also passes the mint and the decimals, and the Token program rejects the transfer if they don't match the mint.

Small detail, but a wrong decimals assumption becomes a failed transaction instead of a wrong amount.

---

4/

Task 2, the NFT. With the older Token Metadata standard, one NFT is a mint, a token account, a metadata account and a master edition.

With Metaplex Core it's one account. Owner, update authority, name and URI live together. My asset uses about 0.003 SOL of rent.

---

5/

The image and the JSON metadata go to Irys. On chain, the asset only stores a URI to that JSON. Wallets fetch it to show the image and traits.

Lesson from my Q3 run: Irys deletes devnet uploads after ~60 days. That NFT still exists, but its image is a 404 now.

---

6/

Task 3, the update. My wallet is the update authority, so it can sign UpdateV2 with a new name ("Turbin3 Rug v2") and a new JSON URI. One instruction, under 8k compute units.

The owner transfers the asset. The update authority (or its delegate) edits the metadata.

---

7/

A bug worth sharing: right after the update, my script read the asset and printed the OLD name. The tx was fine.

Cause: with no commitment set, the confirm could return at "processed" but the read used "finalized".

Fix: createUmi(url, { commitment: "confirmed" })

---

8/

Why it matters: tokens and Core assets are a base layer for points, tickets, game items and memberships. Metadata that the right key can edit lets a ticket show "used" or an item level up, with no new mint.

Code, signatures and tests:
https://github.com/nada-r/spl-nft-q426
