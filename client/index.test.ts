import * as borsh from "borsh";

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

