import { readFileSync } from "fs";
import { homedir } from "os";

// Devnet RPC. Set SOLANA_RPC_URL to use another endpoint.
export const RPC_URL =
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

// The websocket endpoint. By default it is the RPC URL with ws:// or wss://.
export const WS_URL =
  process.env.SOLANA_WS_URL ?? RPC_URL.replace(/^http/, "ws");

// The Irys node that stores the image and the metadata JSON on devnet.
export const IRYS_URL = "https://devnet.irys.xyz/";

// The keypair file. Set WALLET_PATH to use another wallet.
// The default is the Solana CLI wallet, so no keypair is copied into the repo.
export const WALLET_PATH = (
  process.env.WALLET_PATH ?? "~/.config/solana/id.json"
).replace(/^~(?=$|\/)/, homedir());

// Reads the keypair file: a JSON array of 64 numbers.
export function loadWallet(): Uint8Array {
  const bytes = JSON.parse(readFileSync(WALLET_PATH, "utf8")) as number[];
  return new Uint8Array(bytes);
}
