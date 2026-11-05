import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { loadWallet, RPC_URL } from "../config";
import { MINT, need } from "../addresses";

const umi = createUmi(RPC_URL);

const keypair = umi.eddsa.createKeypairFromSecretKey(loadWallet());
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const mint = publicKey(need("MINT", MINT));

    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };

    // The on-chain name, symbol, and URI of the token.
    const data: DataV2Args = {
      name: "Turbin3 Rug Token",
      symbol: "RUGT",
      uri: "",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };

    // isMutable lets the update authority change the data later.
    const args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    };

    const tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });

    const result = await tx.sendAndConfirm(umi);
    console.log(`metadata txid: ${bs58.encode(Buffer.from(result.signature))}`);
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  }
})();
