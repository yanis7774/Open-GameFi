#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token::Client as TokenClient, Address, Env, Map
};

#[derive(Clone)]
#[contracttype]
pub struct BalanceInfo {
    pub token: Address,
    pub amount: i128,
    pub base_withdrawal_limit: i128
}

#[derive(Clone)]
#[contracttype]
pub struct RewardType {
    pub id: i128,
    pub price: i128,
    pub max_amount: i128
}

#[derive(Clone)]
#[contracttype]
pub struct RewardInfo {
    pub reward: i128,
    pub amount: i128
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Balance(Address),
}

#[contracttype]
#[derive(Clone)]
pub enum Rewards {
    Redeemed(Address)
}

#[contracttype]
#[derive(Clone)]
pub enum RewardList {
    Rewards(i128)
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
    OutOfBounds = 8,
    NotAdmin = 9,
    RewardLimit = 10,
}

#[contract]
pub struct CustomAccountContract;

#[contractimpl]
impl CustomAccountContract {

    // Initialize function to set up the main map and admin address
    pub fn initialize(env: Env, admin: Address) {
        // Check if the admin is already set
        if env.storage().instance().has(&"admin") {
            panic!("Admin has already been initialized.");
        }

        // Set the admin address
        env.storage().instance().set(&"admin", &admin);

        // Initialize the main map
        let main_map: Map<Address, Map<u32, i32>> = Map::new(&env);
        env.storage().instance().set(&"main_map", &main_map);
    }

    // Set new reward type
    pub fn set_reward(env: Env, id: i128, price: i128, max_amount: i128) -> Result<i128, AccError> {
        let admin: Address = env.storage().instance().get(&"admin").expect("Admin is not initialized.");
        admin.require_auth();
        //if admin == env.invoker() {
        let new_reward: RewardType = RewardType{
            id: id,
            price: price,
            max_amount: max_amount
        };
        env.storage().instance().set(&RewardList::Rewards(id.clone()), &new_reward);
        Ok(1)
        //} else {
        //  return Err(AccError::NotAdmin)
        //}
    }

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

    pub fn activate_reward(env: Env, reward_address: Address, reward_id: i128) -> Result<i128, AccError>{
        reward_address.require_auth();

        // Retrieve balance information.
        let mut balance: BalanceInfo = env.storage().instance().get(&DataKey::Balance(reward_address.clone()))
            .ok_or(AccError::InsufficientFunds)?;

        // Retrive reward information
        let reward_info: RewardType = env.storage().instance().get(&RewardList::Rewards(reward_id.clone()))
            .ok_or(AccError::OutOfBounds)?;

        // Check if the balance is sufficient.
        if balance.amount < 10000000*reward_info.price {
            return Err(AccError::InsufficientFunds);
        }

        // Update the balance.
        balance.amount -= 10000000*reward_info.price;
        env.storage().instance().set(&DataKey::Balance(reward_address.clone()), &balance);

        // Retrieve or lazily initialize the main_map
        let mut main_map: Map<Address, Map<i128, i128>> = env.storage().instance().get(&"main_map").unwrap_or_else(|| {
            let map = Map::new(&env);
            env.storage().instance().set(&"main_map", &map);
            map
        });
        
        // Access or initialize the nested map
        let mut nested_map = main_map.get(reward_address.clone()).unwrap_or(Map::new(&env));
        
        // Get the current counter value, defaulting to 0 if it doesn't exist
        let counter = nested_map.get(reward_id.clone()).unwrap_or(0);

        if counter + 1 > reward_info.max_amount {

            return Err(AccError::RewardLimit)

        } else {

            // Increment the counter
            nested_map.set(reward_id.clone(), counter + 1);

            // Store the updated nested map back into the main map
            main_map.set(reward_address.clone(), nested_map);

            // Persist the main_map back to storage
            env.storage().instance().set(&"main_map", &main_map);

            Ok(counter + 1)

        }
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