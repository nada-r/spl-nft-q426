// The values that the scripts logged on devnet.
// Each script reads the values of the steps before it.
// After you run a step, write its value here.

// The wallet that signed every transaction (WALLET_PATH in src/config.ts).
export const WALLET = "6M3LySJ4D9y8PwwgeCMCs56MHAUa8ZJh3PYn5vmxGghE";

// The wallet that receives 10 tokens in spl_transfer.ts.
export const RECIPIENT = "AEyXeEqQzru9rYhJ9k7QekMAMnEpdtnC4yAmHaUFZQQA";

// Task 1: from spl_init.ts.
export const MINT = "7WAetXWZ5vF5YqwVJGBbT3miXFWE6atVXyq9Ay9wPTox";

// Task 2: from nft_image.ts, nft_metadata.ts, and nft_mint.ts.
export const IMAGE_URI = "https://gateway.irys.xyz/3KMiNUfasFQShFBYHMscQ68hnZbC7JeShm5cYda8DVeZ";
export const METADATA_URI = "https://gateway.irys.xyz/F4nATic5Zc2wiaTnZqLpc9gas1opnhujVrybeCZuUWDu";
export const ASSET = "4bG5Lk9yXB7nBDS5bomL29YvivGwDxnSE7CDxU5pnVf6";

// Task 3: from nft_update.ts.
export const NEW_METADATA_URI = "https://gateway.irys.xyz/Fo9N47GYUvG7eUwoKqFZhzERoKsCaGF5NBM7TUQ9S8Tx";

// Stops a script if a value from an earlier step is missing.
export function need(name: string, value: string): string {
  if (!value) {
    throw new Error(
      `${name} is empty in src/addresses.ts. Run the step that logs it first.`,
    );
  }
  return value;
}
