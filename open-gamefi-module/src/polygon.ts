const ethers = require('ethers');

const polygonConfig: any = {
    gasPrice: 50,
    gasLimit: 100000,
    contractAddress: "",
    contractAbi: [],
    provider: undefined
}

export async function setupPolygonOptions(json_rpc: string, abi: any, contractAddress: string, gasPrice: number, gasLimit: number) {
    polygonConfig.gasLimit = gasLimit;
    polygonConfig.provider = new ethers.JsonRpcProvider(json_rpc);
    polygonConfig.gasPrice = gasPrice;
    polygonConfig.contractAbi = abi;
    polygonConfig.contractAddress = contractAddress;
}

export async function createPolygonAccount() {
     // Create a random wallet
     const wallet = ethers.Wallet.createRandom();
    
     console.log("Address:", wallet.address);
     console.log("Private Key:", wallet.privateKey);
     console.log("Mnemonic:", wallet.mnemonic.phrase);
 
     // To use this wallet with the Polygon network, we need to connect it to a provider
     const walletWithProvider = wallet.connect(polygonConfig.provider);
 
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
    const walletWithProvider = wallet.connect(polygonConfig.provider);

    console.log("Wallet Address:", walletWithProvider.address);
    return {
        mnemonic: wallet.mnemonic.phrase,
        wallet: walletWithProvider,
        publicKey: wallet.address,
        secretKey: wallet.privateKey
    }
}

export async function polygonDeposit(secretKey: string, amount: number) {
    const wallet = new ethers.Wallet(secretKey, polygonConfig.provider);
    const contract = new ethers.Contract(polygonConfig.contractAddress, polygonConfig.contractAbi, wallet);
    const tx = await contract.deposit({
        value: ethers.parseEther(`${amount}`),
        gasLimit: polygonConfig.gasLimit,
        gasPrice: ethers.parseUnits(`${polygonConfig.gasPrice}`, 'gwei')
    });
    await tx.wait();
    return Number(tx);
}

export async function polygonWithdraw(secretKey: string, amount: number) {
    const wallet = new ethers.Wallet(secretKey, polygonConfig.provider);
    const contract = new ethers.Contract(polygonConfig.contractAddress, polygonConfig.contractAbi, wallet);
    const tx = await contract.withdraw(ethers.parseEther(`${amount}`),{
        gasLimit: polygonConfig.gasLimit,
        gasPrice: ethers.parseUnits(`${polygonConfig.gasPrice}`, 'gwei')
    });
    await tx.wait();
    return Number(tx);
}

export async function polygonBalance(secretKey: string, publicKey: string) {
    const wallet = new ethers.Wallet(secretKey, polygonConfig.provider);
    const contract = new ethers.Contract(polygonConfig.contractAddress, polygonConfig.contractAbi, wallet);
    try {
        const balance = await contract.getBalance(publicKey,{
            gasLimit: polygonConfig.gasLimit,
            gasPrice: ethers.parseUnits(`${polygonConfig.gasPrice}`, 'gwei')
        });
        return (Number(balance)/100000000)/10000000000;
    } catch (error) {
        console.error("Error fetching balance:", error);
        throw error;
    }
}

export async function polygonReward(secretKey: string, rewardId: number) {
    const wallet = new ethers.Wallet(secretKey, polygonConfig.provider);
    const contract = new ethers.Contract(polygonConfig.contractAddress, polygonConfig.contractAbi, wallet);
    const tx = await contract.incrementCounter(rewardId,{
        gasLimit: polygonConfig.gasLimit,
        gasPrice: ethers.parseUnits(`${polygonConfig.gasPrice}`, 'gwei')
    });
    await tx.wait();
    return Number(await contract.getCounter(rewardId,{
        gasLimit: polygonConfig.gasLimit,
        gasPrice: ethers.parseUnits(`${polygonConfig.gasPrice}`, 'gwei')
    }));
}

export async function polygonRewardBalance(secretKey: string, publicKey: string, rewardId: number) {
    const wallet = new ethers.Wallet(secretKey, polygonConfig.provider);
    const contract = new ethers.Contract(polygonConfig.contractAddress, polygonConfig.contractAbi, wallet);
    const tx = await contract.getIDAmount(publicKey, rewardId, {
        gasLimit: polygonConfig.gasLimit,
        gasPrice: ethers.parseUnits(`${polygonConfig.gasPrice}`, 'gwei')
    });
    return Number(tx);
}