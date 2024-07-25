import { Client, Room } from "colyseus";
import { MainRoomState } from "./schema/MainRoomState";
import { BASE_FEE, Contract, Keypair, Networks, SorobanRpc, StrKey, TransactionBuilder, xdr } from "stellar-sdk";
import { getUser, initUser } from "../db/dbUtils";
//import { Server } from "@stellar/stellar-sdk/lib/horizon";
const bip39 = require('bip39');
const StellarHDWallet = require('stellar-hd-wallet');
const bcrypt = require('bcrypt');
const axios = require('axios');

const saltRounds = 10;
const xmlConversion = 10000000;
const WithdrawalLimit = 10000;

export class MainRoom extends Room<MainRoomState> {
    onCreate(options: any) {
        this.setState(new MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;

        this.onMessage("createWallet", async (client, msg) => {
            const mnemonic = bip39.generateMnemonic();
            const wallet = StellarHDWallet.fromMnemonic(mnemonic);
            const publicKey = wallet.getPublicKey(0);
            const secretKey = wallet.getSecret(0);

            client.send("createWallet", { 
                publicKey: publicKey,
                secret: secretKey,
                mnemonic: mnemonic
            })
            client.send("systemMessage","Wallet created!");
        })

        this.onMessage("connectWallet", async (client, msg) =>{
            const wallet = StellarHDWallet.fromMnemonic(msg.mnemonic);
            const secretKey = wallet.getSecret(0);
            const pair = Keypair.fromSecret(secretKey);
            client.send("connectWallet",{
                publicKey: pair.publicKey(),
                secretKey: secretKey,
                mnemonic: msg.mnemonic
            });
            client.send("systemMessage","Wallet connected!");
        });

        this.onMessage("payService", async (client, msg) => {
            client.send("payService", {
                publicKey: "GA7K4RFFZ2EJXLCYVGQJU7PUKTEHKGQW6UAQXWEE6BDWN26HEJAQYDSF",
                price: 100,
            });
        });

        this.onMessage("login", async (client, msg) => {
            const userToLogin = await getUser(msg.login);
            client.send("systemMessage","Logging in process...");
            if (userToLogin) {
                if (await bcrypt.compare(msg.password, userToLogin.password)) {
                    client.send("connectWallet",{
                        publicKey: userToLogin.publicId,
                        secretKey: userToLogin.secretId,
                        mnemonic: userToLogin.mnemonic,
                        balance: await this.getBalance(userToLogin.secretId)
                    });
                    client.send("systemMessage","Login Successful!");
                } else {
                    client.send("systemMessage","Username or password is wrong");
                }
            } else {
                client.send("systemMessage","Username or password is wrong");
            }
        });

        this.onMessage("withdrawWallet", async (client, msg) => {
            client.send("systemMessage","Withdrawing...");
            const res = await this.withdrawBalance(msg.secret, Number(msg.amount));
            client.send("balanceUpdate",{balance: res, systemMessage: "Withdraw success!"});
        });

        this.onMessage("depositWallet", async (client, msg) => {
            client.send("systemMessage","Depositing...");
            const res = await this.depositBalance(msg.secret, Number(msg.amount));
            client.send("balanceUpdate",{balance: res, systemMessage: "Deposit success!"});
        });

        this.onMessage("register", async (client, msg) => {
            const userExists = await getUser(msg.login);
            if (userExists) {
                client.send("systemMessage","Username already exists");
            } else {
                const mnemonic = bip39.generateMnemonic();
                const wallet = StellarHDWallet.fromMnemonic(mnemonic);
                const publicKey = wallet.getPublicKey(0);
                const secretKey = wallet.getSecret(0);
                await initUser(msg.login,await bcrypt.hash(msg.password, saltRounds),publicKey,secretKey,mnemonic);
                const horizonUrl = 'https://horizon-testnet.stellar.org';

                //const server = new Server('https://horizon-testnet.stellar.org');
                const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
                axios.get(friendbotUrl)
                    .then((response:any) => {
                        console.log('Account created and funded!');
                        //return server.loadAccount(publicKey);
                    })
                    .then((account:any) => {
                        console.log('Account loaded successfully:', account);
                    })
                    .catch((error:any) => {
                        console.error('Error creating or funding account:', error);
                    });

                client.send("systemMessage","User created, login to see your public wallet");
            }
        })
    }

    async depositBalance(secretKey: string, amount: number) {
        console.log("Starting deposit function")
        const sourceKeypair = Keypair.fromSecret(secretKey);
        const contract = new Contract(process.env.CONTRACT);
        const tokenContract = new Contract(process.env.TOKEN);
        const res = await this.invokeContract(secretKey,contract.call(
            "deposit",
            xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())),
            xdr.ScVal.scvAddress(tokenContract.address().toScAddress()),
            createI128(xmlConversion*amount),
            createI128(xmlConversion*WithdrawalLimit)
        ));
        return Number(res["_value.0._attributes.val._value._attributes.lo._value"]) / xmlConversion;
    }

    async withdrawBalance(secretKey: string, amount: number) {
        console.log("Starting deposit function")
        const sourceKeypair = Keypair.fromSecret(secretKey);
        const contract = new Contract(process.env.CONTRACT);
        const res = await this.invokeContract(secretKey,contract.call(
            "withdraw",
            xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey())),
            createI128(xmlConversion*amount)
        ));
        return Number(res["_value.0._attributes.val._value._attributes.lo._value"]) / xmlConversion;
    }

    async getBalance(secretKey: string) {
        console.log("Starting get balance function")
        const sourceKeypair = Keypair.fromSecret(secretKey);
        const contract = new Contract(process.env.CONTRACT);
        const res = await this.invokeContract(secretKey,contract.call("get_balance", xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(sourceKeypair.xdrPublicKey()))));
        return Number(res["_value._attributes.lo._value"]) / xmlConversion;
    }

    async invokeContract(secret: string, invoke: any) {
        const sourceKeypair = Keypair.fromSecret(secret);
        console.log(`Starting contract invoke, making server, using ${secret}`);
        const server = new SorobanRpc.Server(
            "https://soroban-testnet.stellar.org",
        );
        console.log("Making source account");
        let sourceAccount = undefined;
        try {
            sourceAccount = await server.getAccount(sourceKeypair.publicKey());
        } catch(e) {
            console.log(`ERROR: ${e}`);
        }
        console.log("Source account created, building transaction");

        let builtTransaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        }).addOperation(invoke)
        .setTimeout(30)
        .build();

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
            
                //console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);
            
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

    async setUp(room: Room) {
        try {
            console.log("Setting up lobby room...");
        } catch (error) {
            console.error("Error in createImage handler:", error);
        }
    }

    async onJoin(client: Client, options: any) {
        console.log("Joined lobby room successfully...");
    }

    async onLeave(client: Client, consented: boolean) {
        console.log("Leaving lobby room successfully...");
    }

    async onDispose() {
        console.log("Disposed lobby room successfully...");
    }

}

interface ParsedResult {
    [key: string]: any;
}

function parseResponse(response: any): ParsedResult {
    const result: ParsedResult = {};

    function parseObject(obj: any, prefix: string = ''): void {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'object' && value !== null) {
                parseObject(value, fullKey);
            } else {
                console.log(`KEY: ${fullKey}, VALUE: ${value}`);
                result[fullKey] = value;
            }
        }
    }

    parseObject(response);

    return result;
}

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