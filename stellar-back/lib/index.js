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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@colyseus/tools");
// Import app config
const app_config_1 = __importDefault(require("./app.config"));
const dbUtils_1 = require("./db/dbUtils");
const stellar_sdk_1 = require("@stellar/stellar-sdk");
// Create and listen on 2567 (or PORT environment variable.)
(0, tools_1.listen)(app_config_1.default, Number(process.env.PORT) || 3029);
(0, dbUtils_1.initDatabase)();
// for testing
function invoke() {
    return __awaiter(this, void 0, void 0, function* () {
        const secret = 'SB5CBDYMLH57RO4ND5VFFNXHVDVWTJMAIZOOI6QCZC3MTJLO2ADGEBY4';
        const sourceKeypair = stellar_sdk_1.Keypair.fromSecret(secret);
        //const server = new Server('https://soroban-testnet.stellar.org');
        const server = new stellar_sdk_1.SorobanRpc.Server("https://soroban-testnet.stellar.org");
        const networkPassphrase = stellar_sdk_1.Networks.TESTNET;
        const sourceAccount = yield server.getAccount(sourceKeypair.publicKey());
        const contractAddress = 'CCT45KD5MIW23YM4C2AFMGJC6RGWEQNZBOI44PHMK7KDE2ZS2LKBHFVE';
        const contract = new stellar_sdk_1.Contract(contractAddress);
        let builtTransaction = new stellar_sdk_1.TransactionBuilder(sourceAccount, {
            fee: stellar_sdk_1.BASE_FEE,
            networkPassphrase: stellar_sdk_1.Networks.TESTNET,
        }).addOperation(contract.call('hello', stellar_sdk_1.xdr.ScVal.scvSymbol("to")))
            // This transaction will be valid for the next 30 seconds
            .setTimeout(30)
            .build();
        let preparedTransaction = yield server.prepareTransaction(builtTransaction);
        preparedTransaction.sign(sourceKeypair);
        console.log(`Signed prepared transaction XDR: ${preparedTransaction
            .toEnvelope()
            .toXDR("base64")}`);
        try {
            let sendResponse = yield server.sendTransaction(preparedTransaction);
            console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`);
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
                console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);
                if (getResponse.status === "SUCCESS") {
                    // Make sure the transaction's resultMetaXDR is not empty
                    if (!getResponse.resultMetaXdr) {
                        throw "Empty resultMetaXDR in getTransaction response";
                    }
                    // Find the return value from the contract and return it
                    let transactionMeta = getResponse.resultMetaXdr;
                    let returnValue = getResponse.returnValue;
                    console.log(`Transaction result: ${returnValue}`);
                }
                else {
                    throw `Transaction failed: ${getResponse.resultXdr}`;
                }
            }
            else {
                throw sendResponse.errorResult;
            }
        }
        catch (err) {
            // Catch and report any errors we've thrown
            console.log("Sending transaction failed");
            console.log(JSON.stringify(err));
        }
    });
}
invoke();
