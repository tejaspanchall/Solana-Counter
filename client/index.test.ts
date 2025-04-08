import * as borsh from "borsh";
import { Keypair, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from "@solana/web3.js";
import { test, expect } from "bun:test";

class CounterAccount {
    count = 0;

    constructor({count}: {count: number}) {
        this.count = count;
    }
}

const schema = { struct: { count: "u32" } };

const GREETING_SIZE = borsh.serialize(
    schema,
    new CounterAccount({count: 0})
).length;

let counterAccountKeypair: Keypair;
let adminKeypair: Keypair;

test("counter does increase", async () => {
    adminKeypair = Keypair.generate();
    counterAccountKeypair = new Keypair();

    const connection = new Connection("http://localhost:8899", "confirmed");
    const res = await connection.requestAirdrop(adminKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(res);

    const programId = new PublicKey("AmRPAbSzoeQqF76oXAuXevrSVa5CmIbeVj6L9AY1SuU");
    const lamports = await connection.getMinimumBalanceForRentExemption(
        GREETING_SIZE
    );

    const createCounterAccIx = SystemProgram.createAccount({
        fromPubkey: adminKeypair.publicKey,
        lamports,
        newAccountPubkey: counterAccountKeypair.publicKey,
        programId: programId,
        space: GREETING_SIZE,
    });

    const tx = new Transaction();

    tx.add(new TransactionInstruction({
        keys: [{
            pubkey: counterAccountKeypair.publicKey,
            isSigner: false,
            isWritable: true,
        }],
        programId: programId,
        data: Buffer.from(new Uint8Array([0, 1, 0, 0, 0])),
    }));

    const txHash = await connection.sendTransaction(tx, [adminKeypair, counterAccountKeypair]);
    await connection.confirmTransaction(txHash);
    console.log(txHash);

    const counterAccount = await connection.getAccountInfo(counterAccountKeypair.publicKey);
    if (!counterAccount) {
        throw new Error("Counter account not found");
    }
    const counter = borsh.deserialize(schema, counterAccount.data) as CounterAccount;
    console.log(counter.count);
    expect(counter.count).toBe(0);
});
