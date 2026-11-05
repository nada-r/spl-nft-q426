import {
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import {
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";
import { loadWallet, RPC_URL, WS_URL } from "../config";
import { MINT } from "../addresses";

const rpc = createSolanaRpc(RPC_URL);
const rpcSubscriptions = createSolanaRpcSubscriptions(WS_URL);

// One token has 6 decimal places. Keep the same value in spl_mint.ts.
const DECIMALS = 6;

(async () => {
  try {
    // Each run creates a new mint. Stop if a mint is already recorded.
    if (MINT && process.env.FORCE !== "1") {
      console.log(`A mint is already in src/addresses.ts: ${MINT}`);
      console.log("Set FORCE=1 to create a new mint.");
      return;
    }

    const signer = await createKeyPairSignerFromBytes(loadWallet());

    // Step 1: make a new keypair. Its public key becomes the mint address.
    const mint = await generateKeyPairSigner();

    // Step 2: read the size of a mint account and the rent for that size.
    const space = getMintSize();
    const lamports = await rpc
      .getMinimumBalanceForRentExemption(BigInt(space))
      .send();

    // Step 3: the System Program creates the account. The Token Program owns it.
    const createAccountIx = getCreateAccountInstruction({
      payer: signer,
      newAccount: mint,
      lamports,
      space,
      programAddress: TOKEN_PROGRAM_ADDRESS,
    });

    // Step 4: the Token Program writes the mint data. The wallet is the authority.
    const initMintIx = getInitializeMintInstruction({
      mint: mint.address,
      decimals: DECIMALS,
      mintAuthority: signer.address,
      freezeAuthority: signer.address,
    });

    // Step 5: put both instructions in one transaction and send it.
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const msg = createTransactionMessage({ version: 0 });
    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);
    const msgWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      msgWithPayer,
    );
    const txMessage = appendTransactionMessageInstructions(
      [createAccountIx, initMintIx],
      msgWithLifetime,
    );

    const signedTx = await signTransactionMessageWithSigners(txMessage);
    assertIsTransactionWithBlockhashLifetime(signedTx);
    const signature = getSignatureFromTransaction(signedTx);

    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });
    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    console.log(`mint address: ${mint.address}`);
    console.log(`init txid: ${signature}`);
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  }
})();
