import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { loadWallet, RPC_URL } from "../config";
import { ASSET, METADATA_URI, need } from "../addresses";

// Reads and confirms use the same commitment, so a read after a send sees the new state.
const umi = createUmi(RPC_URL, { commitment: "confirmed" });

const keypair = umi.eddsa.createKeypairFromSecretKey(loadWallet());
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    // Each run mints a new asset. Stop if an asset is already recorded.
    if (ASSET && process.env.FORCE !== "1") {
      console.log(`An asset is already in src/addresses.ts: ${ASSET}`);
      console.log("Set FORCE=1 to mint a new one.");
      return;
    }

    const metadataUri = need("METADATA_URI", METADATA_URI);

    // New keypair. Its public key becomes the NFT address.
    const asset = generateSigner(umi);

    // Metaplex Core stores the name and the uri in one account.
    // The owner and the update authority default to umi.identity (the wallet).
    const tx = await create(umi, {
      asset,
      name: "Turbin3 Rug",
      uri: metadataUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log(`asset address: ${asset.publicKey}`);
    console.log(`mint txid: ${signature}`);
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  }
})();
