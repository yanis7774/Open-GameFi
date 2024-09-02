const { ethers } = require("ethers");
require('dotenv').config();

const contractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "purchasePrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxLimit",
				"type": "uint256"
			}
		],
		"name": "addIDProperties",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "counters",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "deposit",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getIDLimit",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getIDPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "idProperties",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "purchasePrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxLimit",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "incrementCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

async function main() {
    // Set up a provider for the Polygon network
    const provider = new ethers.JsonRpcProvider(process.env.JSON_RPC);

    // Replace with your own private key or load from a secure source
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Simple Solidity contract (this is an example, use your own contract)
    
    const contractBytecode = process.env.CONTRACT_BYTECODE;

    // Create a ContractFactory and deploy the contract
    const ContractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
	//const estimatedGas = await ethers.provider.estimateGas(contract.deploymentTransaction(tokenAddress).data);
	// Deployment

	var gas = 500000000000
    const contract = await ContractFactory.deploy(process.env.PUBLIC_KEY,{
		gasPrice: gas
	});

	await contract.waitForDeployment();
    
    console.log("CONTRACT: ", contract);

	console.log("CONTRACT ADDRESS: ", contract.target);

    console.log("Contract deployment confirmed!");

	const newContract = new ethers.Contract(contract.target, contractABI, wallet);

	console.log("Setting up reward 1...");
	let tx = await newContract.addIDProperties(1,ethers.parseEther("0.1"),10, {
		gasLimit: 100000,
		gasPrice: ethers.parseUnits('50', 'gwei')
	});
	await tx.wait();
    console.log("Reward 1 set!");
	console.log("Setting up reward 2...");
	tx = await newContract.addIDProperties(2,ethers.parseEther("0.1"),10, {
		gasLimit: 100000,
		gasPrice: ethers.parseUnits('50', 'gwei')
	});
	await tx.wait();
    console.log("Reward 2 set!");
}

main().catch(error => {
    console.error("Error deploying contract:", error);
});
