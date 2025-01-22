# Introduction

Datai Network (DN) is a peer-to-peer network that indexes various blockchains and responds to external queries. It’s a distributed system where nodes collaborate to store essential information like node identities, roles, projection deployment details, active account states, and more. Each DN Node holds a part of this information, working together to maintain the network.

# Projection Developers

This is the public repository which contains some projections implemented by developers.

As a developer, you can contribute to the network by adding projections to increase data coverage and therefore earning $Datai tokens for your work. You can also source data from the network to build your own DApp or project.

This is the link to the documentation which will help you implement a projection by yourself and contribute to the network

## What's a projection

A projection is a bundle of code implemented by a developer who wants to integrate a specific protocol into the Datai Network. The Datai engine compiles these projections and deploys them to IPFS for indexers to run on their nodes.

## What information does each projection provide?

Each projection will provide the following information about a user position in a specific protocol:

- Supplied / borrowed token balances → Amount of tokens which were supplied to the protocol or borrowed by the protocol
- Position token balance → Synthetic token received from the protocol when creating a position (i.e. Liquidity Pool token)
- Reward token balances → Amount of tokens which are pending to be claimed by the user as rewards
- Pool Address → Contract address where the user is supplying or borrowing (i.e. staking contract or lending pool contract)

## What are the components of a projection?

A projection has two main components which will contribute to calculate the active positions previously explained:

- Subgraph → Indexes relevant events, such as a user staking tokens in a contract. The subgraph stores data about these positions, identifying users with open positions. This helps the next component focus only on these users rather than analyzing the entire user base.
- Watcher → Periodically analyzes positions stored by the subgraph and calculates the active position balances.

## How to implement a projection?

You will find here the link to our [documentation](https://datai.network/docs/developers/developing-your-first-projection/)
