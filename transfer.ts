import {
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const suppliedToPubkey = process.argv[2] || null;

if (!suppliedToPubkey) {
  console.log(`Please provide a public key to send to`);
  process.exit(1);
}

const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");
console.log(`suppliedToPubkey: ${suppliedToPubkey}`);

const toPubkey = new PublicKey(suppliedToPubkey);
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
console.log(
  `Loaded our own keypair, the destination public key, and connected to Solana`
);

const transaction = new Transaction();
const LAMPORTS_TO_SEND = 5000;
const sendSolInstruction = SystemProgram.transfer({
  fromPubkey: senderKeypair.publicKey,
  toPubkey,
  lamports: LAMPORTS_TO_SEND,
});

transaction.add(sendSolInstruction);

// I Used CoinGecko API to Fetch SOL price in USD.
async function getSolPriceUSD(): Promise<number> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );
  const data = await res.json();
  return data.solana.usd;
}

async function main() {
  const solPrice = await getSolPriceUSD();
  const solAmount = LAMPORTS_TO_SEND / LAMPORTS_PER_SOL;
  const usdValue = solAmount * solPrice;

  console.log(
    `💸 Transferring ${solAmount} SOL (${usdValue.toFixed(
      6
    )} USD) to ${toPubkey}`
  );

  const start = Date.now();
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    senderKeypair,
  ]);
  const end = Date.now();
  console.log(`✅ Transaction confirmed in ${end - start}ms`);
  console.log(`✅ Transaction signature: ${signature}`);
}

main();
