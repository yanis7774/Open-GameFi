#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token::Client as TokenClient, Address, Env, Map
};

#[derive(Clone)]
#[contracttype]
pub struct BalanceInfo {
    pub amount: i128,
    pub base_withdrawal_limit: i128
}

#[derive(Clone)]
#[contracttype]
pub struct UpgradeType {
    pub id: i128,
    pub price: i128,
    pub max_amount: i128
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Balance(Address),
}

#[contracttype]
#[derive(Clone)]
pub enum Upgrades {
    Redeemed(Address)
}

#[contracttype]
#[derive(Clone)]
pub enum UpgradeList {
    Upgrades(i128)
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
    UpgradeLimit = 10,
    WrongToken = 11,
}

#[contract]
pub struct CustomAccountContract;

#[contractimpl]
impl CustomAccountContract {

    // Initialize function to set up the main map and admin address
    pub fn initialize(env: Env, admin: Address, token: Address) {
        // Check if the admin is already set
        if env.storage().instance().has(&"admin") {
            panic!("Admin has already been initialized.");
        }

        // Set the admin address
        env.storage().instance().set(&"admin", &admin);

        // Set free funds
        env.storage().instance().set(&"locked_funds", &0i128);

        // Set free funds
        env.storage().instance().set(&"token", &token);

        // Initialize the main map
        let main_map: Map<Address, Map<u32, i32>> = Map::new(&env);
        env.storage().instance().set(&"main_map", &main_map);
    }

    pub fn check_locked_funds(env: Env) -> Result<i128, AccError> {
        let locked_funds: i128 = env.storage().instance().get(&"locked_funds").expect("Locked funds are not initialized.");
        Ok(locked_funds)
    }

    pub fn check_token(env: Env) -> Result<Address, AccError> {
        let token_check: Address = env.storage().instance().get(&"token").expect("Token is not initialized.");
        Ok(token_check)
    }

    // Set new upgrade type
    pub fn set_upgrade(env: Env, id: i128, price: i128, max_amount: i128) -> Result<i128, AccError> {
        let admin: Address = env.storage().instance().get(&"admin").expect("Admin is not initialized.");
        admin.require_auth();
        let new_upgrade: UpgradeType = UpgradeType{
            id: id,
            price: price,
            max_amount: max_amount
        };
        env.storage().instance().set(&UpgradeList::Upgrades(id.clone()), &new_upgrade);
        Ok(1)
    }

    pub fn get_contract_balance(env: Env) -> Result<i128, AccError> {
        let token: Address = env.storage().instance().get(&"token").expect("Token is not initialized.");
        let contract_balance: i128 = TokenClient::new(&env, &token).balance(&env.current_contract_address());
        Ok(contract_balance)
    }

    // Withdraw free funds
    pub fn withdraw_free(env: Env, to: Address, amount: i128) -> Result<i128, AccError> {
        let admin: Address = env.storage().instance().get(&"admin").expect("Admin is not initialized.");
        admin.require_auth();

        let locked_funds: i128 = env.storage().instance().get(&"locked_funds").expect("Free funds are not initialized.");

        let token: Address = env.storage().instance().get(&"token").expect("Token is not initialized.");
        let contract_balance: i128 = TokenClient::new(&env, &token).balance(&env.current_contract_address());

        if amount > (contract_balance - locked_funds) {
            return Err(AccError::InsufficientFunds)
        }

        let token: Address = env.storage().instance().get(&"token").expect("Token is not initialized.");
        TokenClient::new(&env, &token).transfer(&env.current_contract_address(), &to, &amount);
        
        Ok(1)
    }

    pub fn donate(env: Env, from: Address, amount: i128) -> Result<i128, AccError> {
        from.require_auth();

        let token: Address = env.storage().instance().get(&"token").expect("Token is not initialized.");
        TokenClient::new(&env, &token).transfer(&from, &env.current_contract_address(), &amount);
        Ok(1)
    }

    pub fn deposit(env: Env, from: Address, token: Address, amount: i128, base_withdrawal_limit: i128) -> Result<BalanceInfo, AccError> {
        from.require_auth();

        let token_check: Address = env.storage().instance().get(&"token").expect("Token is not initialized.");
        if token != token_check {
            return Err(AccError::WrongToken)
        }

        // Transfer token from `from` to this contract.
        TokenClient::new(&env, &token).transfer(&from, &env.current_contract_address(), &amount);

        // Retrieve or initialize balance information.
        let mut balance: BalanceInfo = env.storage().instance().get(&DataKey::Balance(from.clone()))
            .unwrap_or(BalanceInfo{
                amount: 0,
                base_withdrawal_limit: 1000000000,
            });

        // Update the balance.
        balance.amount += amount;
        balance.base_withdrawal_limit = base_withdrawal_limit;

        // Store the updated balance.
        env.storage().instance().set(&DataKey::Balance(from.clone()), &balance);

        // Increase locked funds
        let locked_funds: i128 = env.storage().instance().get(&"locked_funds").expect("Locked funds are not initialized.");
        env.storage().instance().set(&"locked_funds", &(locked_funds + amount));

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
        let token: Address = env.storage().instance().get(&"token").expect("Token is not initialized.");
        TokenClient::new(&env, &token).transfer(&env.current_contract_address(), &to, &amount);

        // Decrease locked funds
        let locked_funds: i128 = env.storage().instance().get(&"locked_funds").expect("Locked funds are not initialized.");
        env.storage().instance().set(&"locked_funds", &(locked_funds - amount));

        Ok(balance)
    }

    pub fn check_upgrade(env: Env, upgrade_address: Address, upgrade_id: i128) -> Result<i128, AccError>{
        let main_map: Map<Address, Map<i128, i128>> = env.storage().instance().get(&"main_map").unwrap_or_else(|| {
            let map = Map::new(&env);
            env.storage().instance().set(&"main_map", &map);
            map
        });
        
        // Access or initialize the nested map
        let nested_map = main_map.get(upgrade_address.clone()).unwrap_or(Map::new(&env));
        
        // Get the current counter value, defaulting to 0 if it doesn't exist
        let counter = nested_map.get(upgrade_id.clone()).unwrap_or(0);

        Ok(counter)
    }

    pub fn activate_upgrade(env: Env, upgrade_address: Address, upgrade_id: i128) -> Result<i128, AccError>{
        upgrade_address.require_auth();

        // Retrieve balance information.
        let mut balance: BalanceInfo = env.storage().instance().get(&DataKey::Balance(upgrade_address.clone()))
            .ok_or(AccError::InsufficientFunds)?;

        // Retrive upgrade information
        let upgrade_info: UpgradeType = env.storage().instance().get(&UpgradeList::Upgrades(upgrade_id.clone()))
            .ok_or(AccError::OutOfBounds)?;

        // Check if the balance is sufficient.
        if balance.amount < 10000000*upgrade_info.price {
            return Err(AccError::InsufficientFunds);
        }

        // Update the balance.
        balance.amount -= 10000000*upgrade_info.price;
        env.storage().instance().set(&DataKey::Balance(upgrade_address.clone()), &balance);

        // Decrease locked funds
        let locked_funds: i128 = env.storage().instance().get(&"locked_funds").expect("Locked funds are not initialized.");
        env.storage().instance().set(&"locked_funds", &(locked_funds - 10000000*upgrade_info.price));

        // Retrieve or lazily initialize the main_map
        let mut main_map: Map<Address, Map<i128, i128>> = env.storage().instance().get(&"main_map").unwrap_or_else(|| {
            let map = Map::new(&env);
            env.storage().instance().set(&"main_map", &map);
            map
        });
        
        // Access or initialize the nested map
        let mut nested_map = main_map.get(upgrade_address.clone()).unwrap_or(Map::new(&env));
        
        // Get the current counter value, defaulting to 0 if it doesn't exist
        let counter = nested_map.get(upgrade_id.clone()).unwrap_or(0);

        if counter + 1 > upgrade_info.max_amount {

            return Err(AccError::UpgradeLimit)

        } else {

            // Increment the counter
            nested_map.set(upgrade_id.clone(), counter + 1);

            // Store the updated nested map back into the main map
            main_map.set(upgrade_address.clone(), nested_map);

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

    pub fn get_free_balance(env: Env) -> Result<i128, AccError> {
        let locked_funds: i128 = env.storage().instance().get(&"locked_funds").expect("Free funds are not initialized.");

        let token: Address = env.storage().instance().get(&"token").expect("Token is not initialized.");
        let contract_balance: i128 = TokenClient::new(&env, &token).balance(&env.current_contract_address());

        Ok(contract_balance - locked_funds)
    }
}