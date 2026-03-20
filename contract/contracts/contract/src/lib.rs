#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct ReputationKey {
    pub target: Address,
    pub topic: String,
}

#[contracttype]
pub enum DataKey {
    Topics,
    Reputations,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Create a new reputation topic. Anyone can create topics - fully permissionless.
    pub fn create_topic(env: Env, topic: String) {
        let mut topics: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::Topics)
            .unwrap_or_else(|| Vec::new(&env));

        topics.push_back(topic);
        env.storage().instance().set(&DataKey::Topics, &topics);
    }

    /// Give reputation to an address for a topic. Anyone can give reputation to anyone.
    pub fn give_reputation(env: Env, giver: Address, to: Address, topic: String, value: i128) {
        giver.require_auth();

        let mut reputations: Map<ReputationKey, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Reputations)
            .unwrap_or_else(|| Map::new(&env));

        let key = ReputationKey {
            target: to,
            topic: topic.clone(),
        };

        let current = reputations.get(key.clone()).unwrap_or(0);
        reputations.set(key, current + value);

        env.storage()
            .persistent()
            .set(&DataKey::Reputations, &reputations);
    }

    /// Get reputation score for an address on a specific topic.
    pub fn get_reputation(env: Env, target: Address, topic: String) -> i128 {
        let reputations: Map<ReputationKey, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Reputations)
            .unwrap_or_else(|| Map::new(&env));

        let key = ReputationKey { target, topic };

        reputations.get(key).unwrap_or(0)
    }

    /// Get all available reputation topics.
    pub fn get_topics(env: Env) -> Vec<String> {
        env.storage()
            .instance()
            .get(&DataKey::Topics)
            .unwrap_or_else(|| Vec::new(&env))
    }
}

mod test;
