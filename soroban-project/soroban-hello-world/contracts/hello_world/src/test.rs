#![cfg(test)]

use super::{Contract, ContractClient};
use soroban_sdk::{symbol, vec, Env};

#[test]
fn test() {
    // In any test the first thing that is always required is an Env,
    // which is the Soroban environment that the contract will run inside of
    let env = Env::default();
    //
}