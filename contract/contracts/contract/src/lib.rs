#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Symbol, Address, Map};

#[contracttype]
#[derive(Clone)]
pub struct UserReputation {
    pub score: i32,
}

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {

    // Initialize reputation (optional)
    pub fn init_user(env: Env, user: Address) {
        let mut storage = env.storage().persistent();

        if storage.has(&user) {
            panic!("User already exists");
        }

        let rep = UserReputation { score: 0 };
        storage.set(&user, &rep);
    }

    // Increase reputation
    pub fn add_reputation(env: Env, user: Address, value: i32) {
        let mut storage = env.storage().persistent();

        let mut rep = storage.get::<Address, UserReputation>(&user)
            .unwrap_or(UserReputation { score: 0 });

        rep.score += value;

        storage.set(&user, &rep);
    }

    // Decrease reputation
    pub fn subtract_reputation(env: Env, user: Address, value: i32) {
        let mut storage = env.storage().persistent();

        let mut rep = storage.get::<Address, UserReputation>(&user)
            .unwrap_or(UserReputation { score: 0 });

        rep.score -= value;

        storage.set(&user, &rep);
    }

    // Get reputation
    pub fn get_reputation(env: Env, user: Address) -> i32 {
        let storage = env.storage().persistent();

        let rep = storage.get::<Address, UserReputation>(&user)
            .unwrap_or(UserReputation { score: 0 });

        rep.score
    }
}