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
const stellar_sdk_1 = require("stellar-sdk");
// Create and listen on 2567 (or PORT environment variable.)
(0, tools_1.listen)(app_config_1.default, Number(process.env.PORT) || 3029);
(0, dbUtils_1.initDatabase)();
function issueAsset() {
    return __awaiter(this, void 0, void 0, function* () {
        const astroDollar = new stellar_sdk_1.Asset("AstroDollar", "GCINXWZRNVSJXOFYGKVKWBAWZ2QQUI62ZWR6HHWVNXQJDBFML4KBDGKU");
        const server = new stellar_sdk_1.Horizon.Server("https://horizon-testnet.stellar.org");
        const issueAccount = yield server.loadAccount("GCINXWZRNVSJXOFYGKVKWBAWZ2QQUI62ZWR6HHWVNXQJDBFML4KBDGKU"); // issuer public key
        const account = yield server.loadAccount("GDL5WPFX2XMOBT3MVM3TLQY3PYRRYKPIXYZVC6ETAIR3JOH2KJ3EWLW6"); // distributor public key
        const transaction = new stellar_sdk_1.TransactionBuilder(account, {
            fee: stellar_sdk_1.BASE_FEE,
            networkPassphrase: stellar_sdk_1.Networks.TESTNET,
        })
            // The `changeTrust` operation creates (or alters) a trustline
            .addOperation(stellar_sdk_1.Operation.changeTrust({
            asset: astroDollar,
            limit: "1000", // optional
            source: "GDL5WPFX2XMOBT3MVM3TLQY3PYRRYKPIXYZVC6ETAIR3JOH2KJ3EWLW6", // distributor public key
        }))
            .setTimeout(100)
            .build();
        const transaction2 = new stellar_sdk_1.TransactionBuilder(issueAccount, {
            fee: stellar_sdk_1.BASE_FEE,
            networkPassphrase: stellar_sdk_1.Networks.TESTNET,
        })
            .addOperation(stellar_sdk_1.Operation.payment({
            destination: "GDL5WPFX2XMOBT3MVM3TLQY3PYRRYKPIXYZVC6ETAIR3JOH2KJ3EWLW6",
            asset: astroDollar,
            amount: '1',
            source: "GCINXWZRNVSJXOFYGKVKWBAWZ2QQUI62ZWR6HHWVNXQJDBFML4KBDGKU"
        }));
    });
}
issueAsset();
