const ethers = require('ethers');

export async function createPolygonAccount(rpc_address: string) {
     // Create a random wallet
     const wallet = ethers.Wallet.createRandom();
    
     console.log("Address:", wallet.address);
     console.log("Private Key:", wallet.privateKey);
     console.log("Mnemonic:", wallet.mnemonic.phrase);
 
     // To use this wallet with the Polygon network, we need to connect it to a provider
     const provider = new ethers.providers.JsonRpcProvider(rpc_address);
     const walletWithProvider = wallet.connect(provider);
 
     return {
        mnemonic: wallet.mnemonic.phrase,
        wallet: walletWithProvider,
        publicKey: wallet.address,
        secretKey: wallet.privateKey
    }
    
    // add +test tokens?
}

export async function loadPolygonAccount(rpc_address: string, privateKey: string) {
    // Create a wallet instance from the private key
    const wallet = new ethers.Wallet(privateKey);

    // Connect the wallet to the Polygon network
    const provider = new ethers.providers.JsonRpcProvider(rpc_address);
    const walletWithProvider = wallet.connect(provider);

    console.log("Wallet Address:", walletWithProvider.address);
    return {
        mnemonic: wallet.mnemonic.phrase,
        wallet: walletWithProvider,
        publicKey: wallet.address,
        secretKey: wallet.privateKey
    }
}
/*
const bip39 = require('bip39');
const StellarHDWallet = require('stellar-hd-wallet');
const axios = require('axios');

let conversionRate = 10000000;
let withdrawLimit = 10000000000000;

export async function setConversionRate(newRate: number) {
    conversionRate = newRate;
}

export async function setWithdrawLimit(newLimit: number) {
    withdrawLimit = newLimit;
}

// This function is used to create i128 type number
function createI128(value: number): xdr.ScVal {
    const high = Math.floor(value / 2 ** 64);
    const low = value % 2 ** 64;
    return xdr.ScVal.scvI128(
        new xdr.Int128Parts({
            hi: xdr.Int64.fromString(high.toString()),
            lo: xdr.Uint64.fromString(low.toString()),
        })
    );
}

export async function invokeContract(secret: string, invoke: any) {
    const sourceKeypair = Keypair.fromSecret(secret);
    console.log(`Starting contract invoke, making server, using ${secret}`);
    const server = new SorobanRpc.Server(
        "https://soroban-testnet.stellar.org",
    );
    console.log("Making source account");
    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
    console.log("Source account created, building transaction");

    // Building transaction using incoming arguments
    let builtTransaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    }).addOperation(invoke)
    .setTimeout(30)
    .build();

    // preparing transaction and signing it
    let preparedTransaction = await server.prepareTransaction(builtTransaction);
    preparedTransaction.sign(sourceKeypair);

    try {
        let sendResponse = await server.sendTransaction(preparedTransaction);
    
        if (sendResponse.status === "PENDING") {
            let getResponse = await server.getTransaction(sendResponse.hash);
            // Poll `getTransaction` until the status is not "NOT_FOUND"
            while (getResponse.status === "NOT_FOUND") {
                console.log("Waiting for transaction confirmation...");
                // See if the transaction is complete
                getResponse = await server.getTransaction(sendResponse.hash);
                // Wait one second
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        
            if (getResponse.status === "SUCCESS") {
                // Make sure the transaction's resultMetaXDR is not empty
                if (!getResponse.resultMetaXdr) {
                    throw "Empty resultMetaXDR in getTransaction response";
                }
                // Find the return value from the contract and return it
                //let transactionMeta = getResponse.resultMetaXdr;
                const result = parseResponse(getResponse.returnValue);
                console.log(`RES: ${result}`);
                return result;
            } else {
                console.log(`Transaction failed: ${getResponse.resultXdr}`)
                return undefined;
            }
        } else {
            console.log(`Transaction failed: ${sendResponse.errorResult}`)
            return undefined;
        }
    } catch (err) {
        // Catch and report any errors we've thrown
        console.log("Sending transaction failed");
        console.log(JSON.stringify(err));
        return undefined;
    }
}

interface ParsedResult {
    [key: string]: any;
}

export async function parseResponse(response: any): Promise<ParsedResult> {
    const result: ParsedResult = {};

    function parseObject(obj: any, prefix: string = ''): void {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'object' && value !== null) {
                parseObject(value, fullKey);
            } else {
                //console.log(`KEY: ${fullKey}, VALUE: ${value}`); <-- uncomment to see parsed object keys
                result[fullKey] = value;
            }
        }
    }

    parseObject(response);

    return result;
}

export async function depositBalance(secretKey: string, amount: number) {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const contract = new Contract(process.env.CONTRACT);
    const tokenContract = new Contract(process.env.TOKEN);
    // filling contract invoke with arguments
    const res = await invokeContract(secretKey,contract.call(
        "deposit", // function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public address
        xdr.ScVal.scvAddress(tokenContract.address().toScAddress()), // Token address
        createI128(conversionRate*amount), // Amount to deposit
        createI128(conversionRate*withdrawLimit) // Setting withdraw limit
    ));
    return Number(res["_value.0._attributes.val._value._attributes.lo._value"]) / conversionRate;
}

export async function withdrawBalance(secretKey: string, amount: number) {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const contract = new Contract(process.env.CONTRACT);
    const res = await invokeContract(secretKey,contract.call(
        "withdraw", // function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public address
        createI128(conversionRate*amount) // Withdraw amount
    ));
    return Number(res["_value.0._attributes.val._value._attributes.lo._value"]) / conversionRate;
}

export async function getBalance(secretKey: string) {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const contract = new Contract(process.env.CONTRACT);
    const res = await invokeContract(secretKey,contract.call(
        "get_balance", // Function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())) // Public key
    ));
    return Number(res["_value._attributes.lo._value"]) / conversionRate;
}

export async function rewardWallet(secretKey: string, rewardId: number) {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const contract = new Contract(process.env.CONTRACT);
    const res = await invokeContract(secretKey,contract.call(
        "activate_reward", // Function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public key
        createI128(rewardId) // Reward Id
    ));
    return Number(res["_value._attributes.lo._value"]);
}

export async function getNftBalance(secretKey: string, nftContract: string = undefined) {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const contract = new Contract(nftContract != undefined ? nftContract : process.env.NFT);
    const res = await invokeContract(secretKey,contract.call(
        "balance", // Function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())) // Public key
    ));
    return Number(res["_value._attributes.lo._value"]) / conversionRate;
}
*/