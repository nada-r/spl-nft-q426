// Each test reads the devnet state and compares it to the expected result
// of the scripts. The addresses come from src/addresses.ts. Run with: npm test
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { address, createSolanaRpc } from "@solana/kit";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import {
  fetchMetadataFromSeeds,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { fetchAsset, mplCore } from "@metaplex-foundation/mpl-core";
import { RPC_URL } from "../config";
import {
  ASSET,
  MINT,
  NEW_METADATA_URI,
  RECIPIENT,
  WALLET,
} from "../addresses";

const rpc = createSolanaRpc(RPC_URL);
const umi = createUmi(RPC_URL, { commitment: "confirmed" })
  .use(mplTokenMetadata())
  .use(mplCore());

describe("Task 1: SPL token", () => {
  test("the mint has 6 decimals and the wallet is the mint authority", async () => {
    const { value } = await rpc
      .getAccountInfo(address(MINT), { encoding: "jsonParsed" })
      .send();
    assert.ok(value, "mint account exists");
    const parsed = value.data as {
      parsed: { info: { decimals: number; mintAuthority: string } };
    };
    assert.equal(parsed.parsed.info.decimals, 6);
    assert.equal(parsed.parsed.info.mintAuthority, WALLET);
  });

  test("the token metadata has the name and the symbol", async () => {
    const metadata = await fetchMetadataFromSeeds(umi, {
      mint: publicKey(MINT),
    });
    assert.equal(metadata.name, "Turbin3 Rug Token");
    assert.equal(metadata.symbol, "RUGT");
    assert.equal(metadata.updateAuthority, WALLET);
  });

  test("the wallet ATA holds 90 tokens after the mint and the transfer", async () => {
    const [ata] = await findAssociatedTokenPda({
      mint: address(MINT),
      owner: address(WALLET),
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    const { value } = await rpc.getTokenAccountBalance(ata).send();
    assert.equal(value.uiAmountString, "90");
  });

  test("the recipient ATA holds the 10 transferred tokens", async () => {
    const [ata] = await findAssociatedTokenPda({
      mint: address(MINT),
      owner: address(RECIPIENT),
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    const { value } = await rpc.getTokenAccountBalance(ata).send();
    assert.equal(value.uiAmountString, "10");
  });
});

describe("Task 2 and 3: MPL Core NFT", () => {
  test("the NFT asset exists and the wallet owns it", async () => {
    const asset = await fetchAsset(umi, publicKey(ASSET));
    assert.equal(asset.owner, WALLET);
  });

  test("the wallet is the update authority", async () => {
    const asset = await fetchAsset(umi, publicKey(ASSET));
    assert.equal(asset.updateAuthority.type, "Address");
    assert.equal(asset.updateAuthority.address, WALLET);
  });

  test("the update changed the name and the metadata URI", async () => {
    const asset = await fetchAsset(umi, publicKey(ASSET));
    assert.equal(asset.name, "Turbin3 Rug v2");
    assert.equal(asset.uri, NEW_METADATA_URI);
  });

  test("the new metadata JSON is online and matches the asset", async () => {
    const res = await fetch(NEW_METADATA_URI);
    assert.equal(res.status, 200);
    const json = (await res.json()) as {
      name: string;
      symbol: string;
      attributes: { trait_type: string; value: string }[];
    };
    assert.equal(json.name, "Turbin3 Rug v2");
    assert.equal(json.symbol, "RUG");
    const cohort = json.attributes.find((a) => a.trait_type === "cohort");
    assert.equal(cohort?.value, "Q4 2026");
  });
});
