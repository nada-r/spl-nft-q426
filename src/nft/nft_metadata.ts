import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { IRYS_URL, loadWallet, RPC_URL } from "../config";
import { IMAGE_URI, need } from "../addresses";

const umi = createUmi(RPC_URL);

const keypair = umi.eddsa.createKeypairFromSecretKey(loadWallet());
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: IRYS_URL }));
umi.use(signerIdentity(signer));

(async () => {
  try {
    const image = need("IMAGE_URI", IMAGE_URI);

    // JSON schema: https://www.metaplex.com/docs/smart-contracts/core/json-schema
    const metadata = {
      name: "Turbin3 Rug",
      symbol: "RUG",
      description: "A generated rug for the Turbin3 Q4 2026 cohort.",
      image,
      attributes: [
        { trait_type: "pattern", value: "generug" },
        { trait_type: "cohort", value: "Q4 2026" },
      ],
      properties: {
        files: [{ type: "image/png", uri: image }],
        category: "image",
      },
    };

    // Upload the JSON to Irys. Returns one URI as a string.
    const metadataUri = await umi.uploader.uploadJson(metadata);
    console.log(`metadata uri: ${metadataUri}`);
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  }
})();
