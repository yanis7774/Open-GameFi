![alt text](https://github.com/yanis7774/Open-GameFi/blob/main/misc/GameFiBanner.png?raw=true)

# Video Example
[![Watch the video](https://raw.githubusercontent.com/yanis7774/Open-GameFi/main/misc/TapDemo.png)](https://raw.githubusercontent.com/yanis7774/Open-GameFi/main/misc/TapDemo.mp4)

# Open GameFi

Revolutionize your game development with Open-GameFi – the ultimate all-in-one solution for blockchain gaming. Our comprehensive starter kit includes an npm module, full-stack examples, and a customizable Tap-To-Earn template, empowering both novices and pros to create and deploy cutting-edge GameFi projects quickly. Join the blockchain gaming market today and shape the future of decentralized entertainment with our easy-to-use tools and step-by-step guides.

## Welcome

Welcome to the Open-GameFi repository! This collection is your gateway to building and deploying decentralized game applications across multiple blockchain networks. Whether you're a seasoned developer or just starting your journey in the world of blockchain, our starter kit offers diverse project examples tailored to various networks, all neatly organized within this repository.

## What's Inside?

- Diverse project examples for multiple blockchain networks
- An npm module for easy integration of GameFi features
- Full-stack examples demonstrating real-world applications
- A customizable Tap-To-Earn template to jumpstart your development

Explore a variety of project examples, each housed in its own folder, showcasing the unique features and capabilities of different blockchain networks. From Ethereum to Solana, and everything in between, we've got you covered with practical examples to kickstart your development process.

## Join our discord!

Connect and collaborate with like-minded developers and innovators. Get support, share your projects and help shape the future of Open-GameFi!
[Link to Discord Server](https://discord.gg/YGX7QxkbQ7)

## Get Started

1. Clone this repository
2. Navigate to the blockchain network folder of your choice
3. Follow the README in each folder to set up and run your example project
4. Customize and build upon the examples to create your own GameFi project

## Project Overview

### 1. Colyseus Backend Setup
- **Purpose:** Set up a real-time game server.
- **Components:**
  - Configurations
  - Game rooms
  - State management
- **Benefits:** Easily synchronize game state between the server and clients.

### 2. Database Connection
- **Technology:** mikro-orm with MongoDB.
- **Features:** 
  - Utilities file for simplified queries.
- **Advantage:** Efficient data storage and retrieval.

### 3. Soroban Smart Contract
- **Includes:** 
  - Ready-to-use smart contract.
  - Deployment commands.
- **Platform:** Soroban (Stellar's smart contract system).

### 4. Token Deposit/Withdraw Module
- **Functionality:** Handle deposits and withdrawals.
- **Supported Tokens:**
  - XLM (Stellar's native currency)
  - Custom tokens
- **Operations:** Balance checks, deposit processing, and withdrawal execution.
- **Wallets** Supports custodial and non-custodial wallets.

### 5. Upgrade Purchasing System
- **Currency:** Contract currency (XLM or custom token).
- **Implementation:** Upgrades managed as a counter.
- **Importance:** Crucial for game economy and progression.

### 6. Token/NFT Creation Contract
- **Type:** Soroban smart contract.
- **Purpose:** Create custom tokens or NFTs.
- **Use Case:** Represent unique in-game assets or achievements.

### 7. Smart Contract Interaction NPM Module
- **Format:** Reusable Node.js package.
- **Content:** Functions to invoke smart contracts.
- **Benefit:** Simplifies blockchain functionality integration.

### 8. React Frontend Setup
- **Components:**
  - User interface design
  - Backend connection
  - Message sending to backend
  - Local state management

### 9. Backend Connection Configuration
- **Features:** 
  - Listeners for real-time updates.
  - Connection state management.
- **Importance:** Ensures smooth data flow between client and server.

### 10. Tap-To-Earn Example
- **Scope:** Complete game implementation.
- **Includes:**
  - Frontend and backend components.
- **Mechanics:**
  - Passive income from generators.
  - Upgrades through upgrades and NFTs.
- **Purpose:** Practical demonstration of feature integration.

## Curreny blockchain readiness

Some blockchains are currently in active development and will be available later.

| Blockchain | Status |
|------------|--------|
|[Stellar](https://github.com/yanis7774/Open-GameFi/tree/main/stellar-pack) | ✅ Ready! |
|[Polygon](https://github.com/yanis7774/Open-GameFi/tree/main/polygon-pack) | ✅ Ready! |
| Solana | 🚧 WIP |

## NPM module

This repository also contains an NPM module used by all project examples across different blockchain networks. It is the main moving part of the starter-kit. After learning how examples work, you can transfer most of the functions packed in Game-Fi by simply importing the open-gamefi module.

```bash
npm i open-gamefi
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a pull request

Please ensure your code adheres to the existing style and includes appropriate tests.

# License
This project is licensed under the MIT License - see the LICENSE file for details.
# Support
If you need help or have any questions, please open an issue in this repository or contact our support team at SUPPORT-MAIL-HERE

Happy gaming and developing!
