import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";
import { IRYS_URL, loadWallet, RPC_URL } from "../config";

// Reads and confirms use the same commitment, so a read after a send sees the new state.
const umi = createUmi(RPC_URL, { commitment: "confirmed" });

const keypair = umi.eddsa.createKeypairFromSecretKey(loadWallet());
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: IRYS_URL }));
umi.use(signerIdentity(signer));

(async () => {
  try {
    // Step 1: read the rug image from the project root.
    const image = await readFile("./rug.png");

    // Step 2: wrap the bytes in the Umi file format.
    const file = createGenericFile(image, "rug.png", {
      contentType: "image/png",
    });

    // Step 3: upload to Irys. The uploader returns one URI per file.
    const [imageUri] = await umi.uploader.upload([file]);
    console.log(`image uri: ${imageUri}`);
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  }
})();
