#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, unwrap::UnwrapOptimized, Address, symbol_short, vec, Env, Symbol, Vec};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Offer,
}

#[derive(Clone)]
#[contracttype]
pub struct Offer {
    // Owner of this offer. Sells sell_token to get buy_token.
    pub seller: Address,
    pub sell_token: Address,
    pub buy_token: Address,
    // Seller-defined price of the sell token in arbitrary units.
    pub sell_price: u32,
    // Seller-defined price of the buy token in arbitrary units.
    pub buy_price: u32,
}

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }

    pub fn create(
        e: Env,
        seller: Address,
        sell_token: Address,
        buy_token: Address,
        sell_price: u32,
        buy_price: u32,
    ) {
        if e.storage().instance().has(&DataKey::Offer) {
            panic!("offer is already created");
        }
        if buy_price == 0 || sell_price == 0 {
            panic!("zero price is not allowed");
        }
        // Authorize the `create` call by seller to verify their identity.
        seller.require_auth();
        write_offer(
            &e,
            &Offer {
                seller,
                sell_token,
                buy_token,
                sell_price,
                buy_price,
            },
        );
    }

    pub fn trade(e: Env, buyer: Address, buy_token_amount: i128, min_sell_token_amount: i128) {
        // Buyer needs to authorize the trade.
        buyer.require_auth();

        // Load the offer and prepare the token clients to do the trade.
        let offer = load_offer(&e);
        let sell_token_client = token::Client::new(&e, &offer.sell_token);
        let buy_token_client = token::Client::new(&e, &offer.buy_token);

        // Compute the amount of token that buyer needs to receive.
        let sell_token_amount = buy_token_amount
            .checked_mul(offer.sell_price as i128)
            .unwrap_optimized()
            / offer.buy_price as i128;

        if sell_token_amount < min_sell_token_amount {
            panic!("price is too low");
        }

        let contract = e.current_contract_address();

        // Perform the trade in 3 `transfer` steps.
        // Note, that we don't need to verify any balances - the contract would
        // just trap and roll back in case if any of the transfers fails for
        // any reason, including insufficient balance.

        // Transfer the `buy_token` from buyer to this contract.
        // This `transfer` call should be authorized by buyer.
        // This could as well be a direct transfer to the seller, but sending to
        // the contract address allows building more transparent signature
        // payload where the buyer doesn't need to worry about sending token to
        // some 'unknown' third party.
        buy_token_client.transfer(&buyer, &contract, &buy_token_amount);
        // Transfer the `sell_token` from contract to buyer.
        sell_token_client.transfer(&contract, &buyer, &sell_token_amount);
        // Transfer the `buy_token` to the seller immediately.
        buy_token_client.transfer(&contract, &offer.seller, &buy_token_amount);
    }

    // Sends amount of token from this contract to the seller.
    // This is intentionally flexible so that the seller can withdraw any
    // outstanding balance of the contract (in case if they mistakenly
    // transferred wrong token to it).
    // Must be authorized by seller.

    pub fn withdraw(e: Env, token: Address, amount: i128) {
        let offer = load_offer(&e);
        offer.seller.require_auth();
        token::Client::new(&e, &token).transfer(
            &e.current_contract_address(),
            &offer.seller,
            &amount,
        );
    }

    // Updates the price.
    // Must be authorized by seller.
    pub fn updt_price(e: Env, sell_price: u32, buy_price: u32) {
        if buy_price == 0 || sell_price == 0 {
            panic!("zero price is not allowed");
        }
        let mut offer = load_offer(&e);
        offer.seller.require_auth();
        offer.sell_price = sell_price;
        offer.buy_price = buy_price;
        write_offer(&e, &offer);
    }

    pub fn get_offer(e: Env) -> Offer {
        load_offer(&e)
    }
    
}

fn load_offer(e: &Env) -> Offer {
    e.storage().instance().get(&DataKey::Offer).unwrap()
}

fn write_offer(e: &Env, offer: &Offer) {
    e.storage().instance().set(&DataKey::Offer, offer);
}

mod test;
