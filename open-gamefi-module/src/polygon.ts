const ethers = require('ethers');

let gasPrice = 50;
let gasLimit = 100000;
let contractAddress = "";
let abi: any = [];
let provider: any = undefined;

export function setupPolygonOptions(json_rpc: string, abi: any, contractAddress: string, gasPrice: number, gasLimit: number) {
    gasPrice = gasPrice;
    gasLimit = gasLimit;
    provider = new ethers.JsonRpcProvider(json_rpc);
    abi = abi;
    contractAddress = contractAddress;
}

export async function createPolygonAccount() {
     // Create a random wallet
     const wallet = ethers.Wallet.createRandom();
    
     console.log("Address:", wallet.address);
     console.log("Private Key:", wallet.privateKey);
     console.log("Mnemonic:", wallet.mnemonic.phrase);
 
     // To use this wallet with the Polygon network, we need to connect it to a provider
     const walletWithProvider = wallet.connect(provider);
 
     return {
        mnemonic: wallet.mnemonic.phrase,
        wallet: walletWithProvider,
        publicKey: wallet.address,
        secretKey: wallet.privateKey
    }
}

export async function loadPolygonAccount(privateKey: string) {
    // Create a wallet instance from the private key
    const wallet = new ethers.Wallet(privateKey);

    // Connect the wallet to the Polygon network
    const walletWithProvider = wallet.connect(provider);

    console.log("Wallet Address:", walletWithProvider.address);
    return {
        mnemonic: wallet.mnemonic.phrase,
        wallet: walletWithProvider,
        publicKey: wallet.address,
        secretKey: wallet.privateKey
    }
}

export async function polygonDeposit(secretKey: string, amount: number) {
    const wallet = new ethers.Wallet(secretKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    const tx = await contract.deposit({
        value: ethers.parseEther(`${amount}`),
        gasLimit: gasLimit,
        gasPrice: ethers.parseUnits(`${gasPrice}`, 'gwei')
    });
    await tx.wait();
    return Number(tx);
}

export async function polygonWithdraw(secretKey: string, amount: number) {
    const wallet = new ethers.Wallet(secretKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    const tx = await contract.withdraw(ethers.parseEther(`${amount}`),{
        gasLimit: gasLimit,
        gasPrice: ethers.parseUnits(`${gasPrice}`, 'gwei')
    });
    await tx.wait();
    return Number(tx);
}

export async function polygonBalance(secretKey: string) {
    const wallet = new ethers.Wallet(secretKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    try {
        const balance = await contract.getBalance({
            gasLimit: gasLimit,
            gasPrice: ethers.parseUnits(`${gasPrice}`, 'gwei')
        });
        return Number(balance);
    } catch (error) {
        console.error("Error fetching balance:", error);
        throw error;
    }
}

export async function polygonReward(secretKey: string, rewardId: number) {
    const wallet = new ethers.Wallet(secretKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    const tx = await contract.incrementCounter(rewardId,{
        gasLimit: gasLimit,
        gasPrice: ethers.parseUnits(`${gasPrice}`, 'gwei')
    });
    await tx.wait();
    return Number(await contract.getCounter(rewardId,{
        gasLimit: gasLimit,
        gasPrice: ethers.parseUnits(`${gasPrice}`, 'gwei')
    }));
}

export async function polygonRewardBalance(secretKey: string, rewardId: string) {
    const wallet = new ethers.Wallet(secretKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    const tx = await contract.getCounter(rewardId,{
        gasLimit: gasLimit,
        gasPrice: ethers.parseUnits(`${gasPrice}`, 'gwei')
    });
    return Number(tx);
}