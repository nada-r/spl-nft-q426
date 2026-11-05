import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstructionAsync,
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { loadWallet, RPC_URL, WS_URL } from "../config";
import { MINT, RECIPIENT, need } from "../addresses";

const rpc = createSolanaRpc(RPC_URL);
const rpcSubscriptions = createSolanaRpcSubscriptions(WS_URL);

// The mint has 6 decimal places. Keep the same value as spl_init.ts.
const DECIMALS = 6;
const token_decimals = 1_000_000n;

(async () => {
  try {
    const mint = address(need("MINT", MINT));
    const to = address(need("RECIPIENT", RECIPIENT));
    const signer = await createKeyPairSignerFromBytes(loadWallet());

    const [fromAta] = await findAssociatedTokenPda({
      mint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    console.log(`wallet ATA: ${fromAta}`);

    const [toAta] = await findAssociatedTokenPda({
      mint,
      owner: to,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    console.log(`recipient ATA: ${toAta}`);

    // Step 1: create the associated token account of the recipient. The wallet pays.
    // A second run fails here because the ATA exists, so no extra tokens move.
    const createAtaIx = await getCreateAssociatedTokenInstructionAsync({
      payer: signer,
      owner: to,
      mint,
    });

    // Step 2: move 10 tokens from the wallet ATA to the recipient ATA.
    // transferChecked also checks the mint and the decimals.
    const transferIx = getTransferCheckedInstruction({
      source: fromAta,
      mint,
      destination: toAta,
      authority: signer,
      amount: 10n * token_decimals,
      decimals: DECIMALS,
    });

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const msg = createTransactionMessage({ version: 0 });
    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);
    const msgWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      msgWithPayer,
    );
    const txMessage = appendTransactionMessageInstructions(
      [createAtaIx, transferIx],
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

    console.log(`transfer txid: ${signature}`);
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  }
})();
