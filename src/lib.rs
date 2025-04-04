use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    entrypoint,
    program_error::ProgramError
};

#[derive(BorshSerialize, BorshDeserialize)]
struct Counter {
    count: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
enum CounterInstruction {
    Increment(u32),
    Decrement(u32),
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account = &accounts.iter().next().ok_or(ProgramError::NotEnoughAccountKeys)?;
    let mut counter: Counter = Counter::try_from_slice(&account.data.borrow())?;

    match CounterInstruction::try_from_slice(instruction_data)? {
        CounterInstruction::Increment(amount: u32) => {
            counter.count += amount;
        }
        CounterInstruction::Decrement(amount: u32) => {
            counter.count -= amount;
        }
    }

    counter.serialize(&mut &mut account.data.borrow_mut()[..])?;
    
    msg!("Counter updated to {}", counter.count);
    
    Ok(())
}
