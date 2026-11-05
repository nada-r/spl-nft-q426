// The values that the scripts logged on devnet.
// Each script reads the values of the steps before it.
// After you run a step, write its value here.

// The wallet that signed every transaction (WALLET_PATH in src/config.ts).
export const WALLET = "6M3LySJ4D9y8PwwgeCMCs56MHAUa8ZJh3PYn5vmxGghE";

// The wallet that receives 10 tokens in spl_transfer.ts.
export const RECIPIENT = "AEyXeEqQzru9rYhJ9k7QekMAMnEpdtnC4yAmHaUFZQQA";

// Task 1: from spl_init.ts.
export const MINT = "";

// Task 2: from nft_image.ts, nft_metadata.ts, and nft_mint.ts.
export const IMAGE_URI = "";
export const METADATA_URI = "";
export const ASSET = "";

// Task 3: from nft_update.ts.
export const NEW_METADATA_URI = "";

// Stops a script if a value from an earlier step is missing.
export function need(name: string, value: string): string {
  if (!value) {
    throw new Error(
      `${name} is empty in src/addresses.ts. Run the step that logs it first.`,
    );
  }
  return value;
}
