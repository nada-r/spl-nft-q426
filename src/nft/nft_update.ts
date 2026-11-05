import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fetchAsset, mplCore, update } from "@metaplex-foundation/mpl-core";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { IRYS_URL, loadWallet, RPC_URL } from "../config";
import { ASSET, IMAGE_URI, need } from "../addresses";

// Reads and confirms use the same commitment, so a read after a send sees the new state.
const umi = createUmi(RPC_URL, { commitment: "confirmed" });

const keypair = umi.eddsa.createKeypairFromSecretKey(loadWallet());
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());
umi.use(irysUploader({ address: IRYS_URL }));

(async () => {
  try {
    const assetAddress = publicKey(need("ASSET", ASSET));
    const image = need("IMAGE_URI", IMAGE_URI);

    // Step 1: read the current on-chain state of the asset.
    const asset = await fetchAsset(umi, assetAddress);
    console.log(`current name: ${asset.name}`);
    console.log(`current uri: ${asset.uri}`);
    console.log(`update authority: ${asset.updateAuthority.address}`);

    // Step 2: build the new metadata JSON and upload it to Irys.
    const newName = "Turbin3 Rug v2";
    const metadata = {
      name: newName,
      symbol: "RUG",
      description: "An updated rug for the Turbin3 Q4 2026 cohort.",
      image,
      attributes: [
        { trait_type: "pattern", value: "generug" },
        { trait_type: "cohort", value: "Q4 2026" },
        { trait_type: "version", value: "2" },
      ],
      properties: {
        files: [{ type: "image/png", uri: image }],
        category: "image",
      },
    };
    const newUri = await umi.uploader.uploadJson(metadata);
    console.log(`new metadata uri: ${newUri}`);

    // Step 3: write the new name and uri to the asset account.
    // The wallet is the update authority, so it signs.
    const tx = await update(umi, {
      asset,
      name: newName,
      uri: newUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];
    console.log(`update txid: ${signature}`);

    // Step 4: read the asset again to confirm the change.
    const updated = await fetchAsset(umi, assetAddress);
    console.log(`updated name: ${updated.name}`);
    console.log(`updated uri: ${updated.uri}`);
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  }
})();
