"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRoom = void 0;
const colyseus_1 = require("colyseus");
const MainRoomState_1 = require("./schema/MainRoomState");
const stellar_sdk_1 = require("stellar-sdk");
const dbUtils_1 = require("../db/dbUtils");
//import { Server } from "@stellar/stellar-sdk/lib/horizon";
const bip39 = require('bip39');
const StellarHDWallet = require('stellar-hd-wallet');
const bcrypt = require('bcrypt');
const axios = require('axios');
const saltRounds = 10;
const xmlConversion = 10000000;
const WithdrawalLimit = 10000;
class MainRoom extends colyseus_1.Room {
    onCreate(options) {
        this.setState(new MainRoomState_1.MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;
        this.onMessage("createWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            // This creates a mnemonic phrase first
            const mnemonic = bip39.generateMnemonic();
            // And then uses it to create a stellar wallet
            const wallet = StellarHDWallet.fromMnemonic(mnemonic);
            const publicKey = wallet.getPublicKey(0);
            const secretKey = wallet.getSecret(0);
            client.send("createWallet", {
                publicKey: publicKey,
                secret: secretKey,
                mnemonic: mnemonic
            });
            client.send("systemMessage", "Wallet created!");
        }));
        this.onMessage("connectWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            // This connectes wallet from mnemonic phrase, not used for now
            const wallet = StellarHDWallet.fromMnemonic(msg.mnemonic);
            const secretKey = wallet.getSecret(0);
            const pair = stellar_sdk_1.Keypair.fromSecret(secretKey);
            client.send("connectWallet", {
                publicKey: pair.publicKey(),
                secretKey: secretKey,
                mnemonic: msg.mnemonic,
                balance: yield this.getBalance(secretKey)
            });
            client.send("systemMessage", "Wallet connected!");
        }));
        this.onMessage("payService", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            // Sends a public key as payment receiver
            client.send("payService", {
                publicKey: "GA7K4RFFZ2EJXLCYVGQJU7PUKTEHKGQW6UAQXWEE6BDWN26HEJAQYDSF",
                price: 100,
            });
        }));
        this.onMessage("login", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            const userToLogin = yield (0, dbUtils_1.getUser)(msg.login);
            client.send("systemMessage", "Logging in process...");
            if (userToLogin) {
                // sent password is compared using bcrypt with the one in database
                if (yield bcrypt.compare(msg.password, userToLogin.password)) {
                    client.send("connectWallet", {
                        publicKey: userToLogin.publicId,
                        secretKey: userToLogin.secretId,
                        mnemonic: userToLogin.mnemonic,
                        balance: yield this.getBalance(userToLogin.secretId)
                    });
                    client.send("systemMessage", "Login Successful!");
                }
                else {
                    client.send("systemMessage", "Username or password is wrong");
                }
            }
            else {
                client.send("systemMessage", "Username or password is wrong");
            }
        }));
        this.onMessage("withdrawWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            client.send("systemMessage", "Withdrawing...");
            const res = yield this.withdrawBalance(msg.secret, Number(msg.amount));
            client.send("balanceUpdate", { balance: res, systemMessage: "Withdraw success!" });
        }));
        this.onMessage("depositWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            client.send("systemMessage", "Depositing...");
            const res = yield this.depositBalance(msg.secret, Number(msg.amount));
            client.send("balanceUpdate", { balance: res, systemMessage: "Deposit success!" });
        }));
        this.onMessage("rewardWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            client.send("systemMessage", "Rewarding...");
            const res = yield this.rewardWallet(msg.secret);
            const balance = yield this.getBalance(msg.secret);
            client.send("balanceUpdate", { balance: balance, systemMessage: `Reward success! You have ${res} rewards!` });
        }));
        this.onMessage("register", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            const userExists = yield (0, dbUtils_1.getUser)(msg.login);
            if (userExists) {
                client.send("systemMessage", "Username already exists");
            }
            else {
                // works like create wallet, generates a mnemonic phrase and then creates a wallet from it
                const mnemonic = bip39.generateMnemonic();
                const wallet = StellarHDWallet.fromMnemonic(mnemonic);
                const publicKey = wallet.getPublicKey(0);
                const secretKey = wallet.getSecret(0);
                yield (0, dbUtils_1.initUser)(msg.login, yield bcrypt.hash(msg.password, saltRounds), publicKey, secretKey, mnemonic);
                // Funding created account with friendbot test xlm
                const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
                axios.get(friendbotUrl)
                    .then((response) => {
                    console.log('Account created and funded!');
                })
                    .then((account) => {
                    console.log('Account loaded successfully:', account);
                })
                    .catch((error) => {
                    console.error('Error creating or funding account:', error);
                });
                client.send("systemMessage", "User created, login to see your public wallet");
            }
        }));
    }
    depositBalance(secretKey, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceKeypair = stellar_sdk_1.Keypair.fromSecret(secretKey);
            const contract = new stellar_sdk_1.Contract(process.env.CONTRACT);
            const tokenContract = new stellar_sdk_1.Contract(process.env.TOKEN);
            // filling contract invoke with arguments
            const res = yield this.invokeContract(secretKey, contract.call("deposit", // function name
            stellar_sdk_1.xdr.ScVal.scvAddress(stellar_sdk_1.xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public address
            stellar_sdk_1.xdr.ScVal.scvAddress(tokenContract.address().toScAddress()), // Token address
            createI128(xmlConversion * amount), // Amount to deposit
            createI128(xmlConversion * WithdrawalLimit) // Setting withdraw limit
            ));
            return Number(res["_value.0._attributes.val._value._attributes.lo._value"]) / xmlConversion;
        });
    }
    withdrawBalance(secretKey, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceKeypair = stellar_sdk_1.Keypair.fromSecret(secretKey);
            const contract = new stellar_sdk_1.Contract(process.env.CONTRACT);
            const res = yield this.invokeContract(secretKey, contract.call("withdraw", // function name
            stellar_sdk_1.xdr.ScVal.scvAddress(stellar_sdk_1.xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())), // Public address
            createI128(xmlConversion * amount) // Withdraw amount
            ));
            return Number(res["_value.0._attributes.val._value._attributes.lo._value"]) / xmlConversion;
        });
    }
    getBalance(secretKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceKeypair = stellar_sdk_1.Keypair.fromSecret(secretKey);
            const contract = new stellar_sdk_1.Contract(process.env.CONTRACT);
            const res = yield this.invokeContract(secretKey, contract.call("get_balance", // Function name
            stellar_sdk_1.xdr.ScVal.scvAddress(stellar_sdk_1.xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())) // Public key
            ));
            return Number(res["_value._attributes.lo._value"]) / xmlConversion;
        });
    }
    rewardWallet(secretKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceKeypair = stellar_sdk_1.Keypair.fromSecret(secretKey);
            const contract = new stellar_sdk_1.Contract(process.env.CONTRACT);
            const res = yield this.invokeContract(secretKey, contract.call("activate_reward", // Function name
            stellar_sdk_1.xdr.ScVal.scvAddress(stellar_sdk_1.xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())) // Public key
            ));
            return Number(res["_value._attributes.lo._value"]) / xmlConversion;
        });
    }
    invokeContract(secret, invoke) {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceKeypair = stellar_sdk_1.Keypair.fromSecret(secret);
            console.log(`Starting contract invoke, making server, using ${secret}`);
            const server = new stellar_sdk_1.SorobanRpc.Server("https://soroban-testnet.stellar.org");
            console.log("Making source account");
            const sourceAccount = yield server.getAccount(sourceKeypair.publicKey());
            console.log("Source account created, building transaction");
            // Building transaction using incoming arguments
            let builtTransaction = new stellar_sdk_1.TransactionBuilder(sourceAccount, {
                fee: stellar_sdk_1.BASE_FEE,
                networkPassphrase: stellar_sdk_1.Networks.TESTNET,
            }).addOperation(invoke)
                .setTimeout(30)
                .build();
            // preparing transaction and signing it
            let preparedTransaction = yield server.prepareTransaction(builtTransaction);
            preparedTransaction.sign(sourceKeypair);
            try {
                let sendResponse = yield server.sendTransaction(preparedTransaction);
                if (sendResponse.status === "PENDING") {
                    let getResponse = yield server.getTransaction(sendResponse.hash);
                    // Poll `getTransaction` until the status is not "NOT_FOUND"
                    while (getResponse.status === "NOT_FOUND") {
                        console.log("Waiting for transaction confirmation...");
                        // See if the transaction is complete
                        getResponse = yield server.getTransaction(sendResponse.hash);
                        // Wait one second
                        yield new Promise((resolve) => setTimeout(resolve, 1000));
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
                    }
                    else {
                        console.log(`Transaction failed: ${getResponse.resultXdr}`);
                        return undefined;
                    }
                }
                else {
                    console.log(`Transaction failed: ${sendResponse.errorResult}`);
                    return undefined;
                }
            }
            catch (err) {
                // Catch and report any errors we've thrown
                console.log("Sending transaction failed");
                console.log(JSON.stringify(err));
                return undefined;
            }
        });
    }
    setUp(room) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Setting up lobby room...");
            }
            catch (error) {
                console.error("Error in createImage handler:", error);
            }
        });
    }
    onJoin(client, options) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Joined lobby room successfully...");
        });
    }
    onLeave(client, consented) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Leaving lobby room successfully...");
        });
    }
    onDispose() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Disposed lobby room successfully...");
        });
    }
}
exports.MainRoom = MainRoom;
function parseResponse(response) {
    const result = {};
    function parseObject(obj, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
                parseObject(value, fullKey);
            }
            else {
                //console.log(`KEY: ${fullKey}, VALUE: ${value}`); <-- uncomment to see parsed object keys
                result[fullKey] = value;
            }
        }
    }
    parseObject(response);
    return result;
}
// This function is used to create i128 type number
function createI128(value) {
    const high = Math.floor(value / Math.pow(2, 64));
    const low = value % Math.pow(2, 64);
    return stellar_sdk_1.xdr.ScVal.scvI128(new stellar_sdk_1.xdr.Int128Parts({
        hi: stellar_sdk_1.xdr.Int64.fromString(high.toString()),
        lo: stellar_sdk_1.xdr.Uint64.fromString(low.toString()),
    }));
}
