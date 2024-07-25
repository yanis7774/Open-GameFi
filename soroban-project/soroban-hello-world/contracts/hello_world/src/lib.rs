#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token::Client as TokenClient, Address, BytesN, Env
};

#[derive(Clone)]
#[contracttype]
pub struct BalanceInfo {
    pub token: Address,
    pub amount: i128,
    pub base_withdrawal_limit: i128
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Balance(Address),
}

#[derive(Clone)]
#[contracttype]
pub struct AccSignature {
    pub public_key: BytesN<32>,
    pub signature: BytesN<64>,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum AccError {
    NotEnoughSigners = 1,
    InvalidSignature = 2,
    InvalidContext = 3,
    InsufficientFunds = 4,
    WithdrawalLimitExceeded = 5,
    UnknownSigner = 6,
    SerializationError = 7,
}

#[contract]
pub struct CustomAccountContract;

#[contractimpl]
impl CustomAccountContract {
    
    pub fn deposit(env: Env, from: Address, token: Address, amount: i128, base_withdrawal_limit: i128) -> Result<BalanceInfo, AccError> {
        from.require_auth();

        // Transfer token from `from` to this contract.
        TokenClient::new(&env, &token).transfer(&from, &env.current_contract_address(), &amount);

        // Create a unique identifier for this balance entry.
        //let balance_id = CustomAccountContract::get_counter(&env);
        //CustomAccountContract::set_counter(&env, balance_id+1);

        // Retrieve or initialize balance information.
        let mut balance: BalanceInfo = env.storage().instance().get(&DataKey::Balance(from.clone()))
            .unwrap_or(BalanceInfo{
                token: token.clone(),
                amount: 0,
                base_withdrawal_limit: 1000000000,
            });


        // Update the balance.
        balance.amount += amount;
        balance.base_withdrawal_limit = base_withdrawal_limit;

        // Store the updated balance.
        env.storage().instance().set(&DataKey::Balance(from.clone()), &balance);

        //Ok(balance_id)
        Ok(balance)
    }

    pub fn withdraw(env: Env, to: Address, amount: i128) -> Result<BalanceInfo, AccError> {
        // Require the current contract to authorize the withdrawal.
        to.require_auth();

        // Retrieve balance information.
        let mut balance: BalanceInfo = env.storage().instance().get(&DataKey::Balance(to.clone()))
            .ok_or(AccError::InsufficientFunds)?;

        // Check if the balance is sufficient.
        if amount > balance.amount {
            return Err(AccError::InsufficientFunds);
        }

        // Update the balance.
        balance.amount -= amount;
        env.storage().instance().set(&DataKey::Balance(to.clone()), &balance);

        // Transfer the token to the `to` address.
        TokenClient::new(&env, &balance.token).transfer(&env.current_contract_address(), &to, &amount);

        Ok(balance)
    }

    pub fn get_balance(env: Env, address_check: Address) -> Result<i128, AccError> {
        if let Some(balance) = env.storage().instance().get::<DataKey, BalanceInfo>(&DataKey::Balance(address_check.clone())) {
            Ok(balance.amount)
        } else {
            // Return 0 if no key is present
            Ok(0)
        }
    }
}