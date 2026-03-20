#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_create_topic() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Anyone can create a topic - no auth required pattern
    client.create_topic(&String::from_str(&env, "helpful"));

    let topics = client.get_topics();
    assert_eq!(topics.len(), 1);
    assert_eq!(topics.get(0), Some(String::from_str(&env, "helpful")));
}

#[test]
fn test_multiple_topics() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.create_topic(&String::from_str(&env, "helpful"));
    client.create_topic(&String::from_str(&env, "reliable"));
    client.create_topic(&String::from_str(&env, "quality"));

    let topics = client.get_topics();
    assert_eq!(topics.len(), 3);
}

#[test]
fn test_give_reputation() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let giver = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.create_topic(&String::from_str(&env, "helpful"));
    client.give_reputation(&giver, &receiver, &String::from_str(&env, "helpful"), &1);

    let rep = client.get_reputation(&receiver, &String::from_str(&env, "helpful"));
    assert_eq!(rep, 1);
}

#[test]
fn test_give_negative_reputation() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let giver1 = Address::generate(&env);
    let giver2 = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.create_topic(&String::from_str(&env, "quality"));
    client.give_reputation(&giver1, &receiver, &String::from_str(&env, "quality"), &-1);
    client.give_reputation(&giver2, &receiver, &String::from_str(&env, "quality"), &-1);

    let rep = client.get_reputation(&receiver, &String::from_str(&env, "quality"));
    assert_eq!(rep, -2);
}

#[test]
fn test_multiple_reputations_same_topic() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let giver1 = Address::generate(&env);
    let giver2 = Address::generate(&env);
    let giver3 = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.create_topic(&String::from_str(&env, "helpful"));
    client.give_reputation(&giver1, &receiver, &String::from_str(&env, "helpful"), &1);
    client.give_reputation(&giver2, &receiver, &String::from_str(&env, "helpful"), &1);
    client.give_reputation(&giver3, &receiver, &String::from_str(&env, "helpful"), &-1);

    let rep = client.get_reputation(&receiver, &String::from_str(&env, "helpful"));
    assert_eq!(rep, 1);
}

#[test]
fn test_reputation_across_topics() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let giver = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    client.create_topic(&String::from_str(&env, "helpful"));
    client.create_topic(&String::from_str(&env, "reliable"));

    client.give_reputation(&giver, &user1, &String::from_str(&env, "helpful"), &5);
    client.give_reputation(&giver, &user1, &String::from_str(&env, "reliable"), &3);
    client.give_reputation(&giver, &user2, &String::from_str(&env, "helpful"), &2);

    assert_eq!(
        client.get_reputation(&user1, &String::from_str(&env, "helpful")),
        5
    );
    assert_eq!(
        client.get_reputation(&user1, &String::from_str(&env, "reliable")),
        3
    );
    assert_eq!(
        client.get_reputation(&user2, &String::from_str(&env, "helpful")),
        2
    );
    assert_eq!(
        client.get_reputation(&user2, &String::from_str(&env, "reliable")),
        0
    );
}

#[test]
fn test_anyone_can_give_reputation() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);
    let target = Address::generate(&env);

    client.create_topic(&String::from_str(&env, "trustworthy"));

    // All three different users can give reputation to the same target
    client.give_reputation(&user1, &target, &String::from_str(&env, "trustworthy"), &1);
    client.give_reputation(&user2, &target, &String::from_str(&env, "trustworthy"), &1);
    client.give_reputation(&user3, &target, &String::from_str(&env, "trustworthy"), &1);

    let rep = client.get_reputation(&target, &String::from_str(&env, "trustworthy"));
    assert_eq!(rep, 3);
}

#[test]
fn test_update_reputation() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let giver1 = Address::generate(&env);
    let giver2 = Address::generate(&env);
    let target = Address::generate(&env);

    client.create_topic(&String::from_str(&env, "quality"));

    // First interaction
    client.give_reputation(&giver1, &target, &String::from_str(&env, "quality"), &5);
    assert_eq!(
        client.get_reputation(&target, &String::from_str(&env, "quality")),
        5
    );

    // Second different user also rates
    client.give_reputation(&giver2, &target, &String::from_str(&env, "quality"), &3);
    assert_eq!(
        client.get_reputation(&target, &String::from_str(&env, "quality")),
        8
    );
}
