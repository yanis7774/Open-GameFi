import { BASE_FEE, Contract, Keypair, Networks, SorobanRpc, Transaction, TransactionBuilder, xdr } from "stellar-sdk";
const bip39 = require('bip39');
const StellarHDWallet = require('stellar-hd-wallet');
const axios = require('axios');

let conversionRate = 10000000;
let withdrawLimit = 10000000000000;
let contractAddress = process.env.CONTRACT;
let contractToken = process.env.TOKEN;

export async function setConversionRate(newRate: number) {
    conversionRate = newRate;
}

export async function setWithdrawLimit(newLimit: number) {
    withdrawLimit = newLimit;
}

export async function setContractAddress(newAddress: string) {
    contractAddress = newAddress;
}

export async function setTokenAddress(newToken: string) {
    contractToken = newToken;
}

export function getStellarAccountFromMnemonic(mnemonic: any) {
    const wallet = StellarHDWallet.fromMnemonic(mnemonic);
    const secretKey = wallet.getSecret(0);
    const publicKey = wallet.getPublicKey(0);
    return {
        mnemonic: mnemonic,
        wallet: wallet,
        publicKey: publicKey,
        secretKey: secretKey
    }
}

export async function createStellarAccount() {
    // works like create wallet, generates a mnemonic phrase and then creates a wallet from it
    const mnemonic = bip39.generateMnemonic();
    const wallet = StellarHDWallet.fromMnemonic(mnemonic);
    const publicKey = wallet.getPublicKey(0);
    const secretKey = wallet.getSecret(0);

    // Funding created account with friendbot test xlm
    const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
    axios.get(friendbotUrl)
        .then((response:any) => {
            console.log('Account created and funded!');
        })

    return {
        mnemonic: mnemonic,
        wallet: wallet,
        publicKey: publicKey,
        secretKey: secretKey
    }
}
// Helper function to extract and decode the transaction result
function extractTransactionResult(transactionResponse: any) {
    if (transactionResponse.resultMetaXdr) {
      const transactionMeta = xdr.TransactionMeta.fromXDR(transactionResponse.resultMetaXdr, 'base64');
      if (transactionMeta.v3().sorobanMeta() && transactionMeta.v3().sorobanMeta().returnValue()) {
        return decodeSorobanResult(transactionMeta.v3().sorobanMeta().returnValue());
      }
    }
    return null;
  }
  

// Helper function to decode Soroban result
function decodeSorobanResult(returnValue: any) {
    // The exact decoding will depend on the type of value returned by your contract
    // This is a basic example that handles a few common types
    if (returnValue.switch().name === 'scvU32') {
      return returnValue.u32();
    } else if (returnValue.switch().name === 'scvI32') {
      return returnValue.i32();
    } else if (returnValue.switch().name === 'scvU64') {
      return returnValue.u64().toString();
    } else if (returnValue.switch().name === 'scvI64') {
      return returnValue.i64().toString();
    } else if (returnValue.switch().name === 'scvString') {
      return returnValue.string().toString();
    } else if (returnValue.switch().name === 'scvBool') {
      return returnValue.bool();
    }
    // Add more type handling as needed
    return `Unhandled type: ${returnValue.switch().name}`;
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

async function createTransaction(publicKey: string) {
    const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
    // Fetch the account details
    const account = await server.getAccount(publicKey);
  
    // Prepare the transaction
    const builder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      });

    return { server, builder, contract: new Contract(contractAddress)};
}

async function finishTransaction(server: SorobanRpc.Server, builder: TransactionBuilder) {

    // Prepare the transaction
    builder.setTimeout(300);

    // Build the transaction
    const transaction = builder.build();
  
    // Prepare the transaction
    const preparedTransaction = await server.prepareTransaction(transaction);
  
    // Convert the transaction to XDR
    const xdrString = preparedTransaction.toXDR();
  
    return xdrString;
}

export async function submitTransaction(signedXdr: any, returnValue: string = "") {
    try {
        const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org")
        // Decode the signed XDR
        let decodedTransaction
        if (typeof signedXdr === 'string') {
            decodedTransaction = xdr.TransactionEnvelope.fromXDR(signedXdr, 'base64')
        } else if (signedXdr.signedTxXdr) {
            decodedTransaction = xdr.TransactionEnvelope.fromXDR(signedXdr.signedTxXdr, 'base64')
        } else {
            throw new Error('Invalid signed XDR format')
        }

        const transaction = new Transaction(decodedTransaction, Networks.TESTNET)

        const sendResponse = await server.sendTransaction(transaction)
        console.log(`Transaction submitted: ${sendResponse.hash}`)

        let result: any;
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for 2 seconds
            try {
                const response = await server.getTransaction(sendResponse.hash)

                if (response.status === "SUCCESS") {
                    console.log("Transaction successful!")
                    result = response.returnValue // Return value of the contract function
                    break
                } else if (response.status === "FAILED") {
                    throw new Error(`Transaction failed: ${JSON.stringify(response)}`)
                }
            } catch (e: any) {
                if (e.message.includes("not found")) {
                    console.log("Transaction not yet processed, retrying...")
                } else {
                    throw e
                }
            }
        }

        return { hash: sendResponse.hash, result: returnValue == "balance" ? result["_value"][0]["_attributes"]["val"]["_value"]["_attributes"]["lo"]["_value"] : (returnValue == "number" ? result["_value"]["_attributes"]["lo"]["_value"] : undefined)}
    } catch (error) {
        console.error("Error submitting transaction:", error)
        throw error
    }
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
    const contract = new Contract(contractAddress);
    const tokenContract = new Contract(contractToken);
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

export async function depositBalanceXdr(publicKey: string, amount: number) {
    const sourceKeypair = Keypair.fromPublicKey(publicKey);
    const tokenContract = new Contract(contractToken);
    const transactionObj = await createTransaction(publicKey);
    transactionObj.builder.addOperation(transactionObj.contract.call(
        "deposit", 
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public address
        xdr.ScVal.scvAddress(tokenContract.address().toScAddress()), // Token address
        createI128(conversionRate*amount), // Amount to deposit
        createI128(conversionRate*withdrawLimit) // Setting withdraw limit));
    ));
    return {
        network: Networks.TESTNET,
        xdr: await finishTransaction(transactionObj.server, transactionObj.builder)
    };
}

export async function withdrawBalance(secretKey: string, amount: number) {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const contract = new Contract(contractAddress);
    const res = await invokeContract(secretKey,contract.call(
        "withdraw", // function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public address
        createI128(conversionRate*amount) // Withdraw amount
    ));
    return Number(res["_value.0._attributes.val._value._attributes.lo._value"]) / conversionRate;
}

export async function withdrawBalanceXdr(publicKey: string, amount: number) {
    const sourceKeypair = Keypair.fromPublicKey(publicKey);
    const transactionObj = await createTransaction(publicKey);
    transactionObj.builder.addOperation(transactionObj.contract.call(
        "withdraw", // function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public address
        createI128(conversionRate*amount) // Withdraw amount
    ));
    return {
        network: Networks.TESTNET,
        xdr: await finishTransaction(transactionObj.server, transactionObj.builder)
    };
}

export async function upgradeWallet(secretKey: string, upgradeId: number) {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const contract = new Contract(contractAddress);
    const res = await invokeContract(secretKey,contract.call(
        "activate_upgrade", // Function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public key
        createI128(upgradeId) // Upgrade Id
    ));
    return Number(res["_value._attributes.lo._value"]);
}

export async function upgradeWalletXdr(publicKey: string, upgradeId: number) {
    const sourceKeypair = Keypair.fromPublicKey(publicKey);
    const transactionObj = await createTransaction(publicKey);
    transactionObj.builder.addOperation(transactionObj.contract.call(
        "activate_upgrade", // Function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public key
        createI128(upgradeId) // Upgrade Id
    ));
    return {
        network: Networks.TESTNET,
        xdr: await finishTransaction(transactionObj.server, transactionObj.builder)
    };
}

export async function withdrawFreeFunds(secretKey: string, amount: number) {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const contract = new Contract(contractAddress);
    const res = await invokeContract(secretKey,contract.call(
        "withdraw_free", // function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public address
        createI128(conversionRate*amount) // Withdraw amount
    ));
    return Number(res["_value.0._attributes.val._value._attributes.lo._value"]) / conversionRate;
}

export async function getBalance(secretKey: string, address: string) {
    const checkKeypair = Keypair.fromPublicKey(address);
    const contract = new Contract(contractAddress);
    const res = await invokeContract(secretKey,contract.call(
        "get_balance", // Function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(checkKeypair.xdrPublicKey())) // Public key
    ));
    return Number(res["_value._attributes.lo._value"]) / conversionRate;
}

export async function getFreeBalance(secretKey: string) {
    const contract = new Contract(contractAddress);
    const res = await invokeContract(secretKey,contract.call(
        "get_free_balance" // Function name
    ));
    return Number(res["_value._attributes.lo._value"]) / conversionRate;
}

export async function checkWallet(secretKey: string, upgradeId: number) {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const contract = new Contract(contractAddress);
    const res = await invokeContract(secretKey,contract.call(
        "check_upgrade", // Function name
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public key
        createI128(upgradeId) // Upgrade Id
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
