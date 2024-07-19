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
const bip39 = require('bip39');
const StellarHDWallet = require('stellar-hd-wallet');
const bcrypt = require('bcrypt');
const saltRounds = 10;
class MainRoom extends colyseus_1.Room {
    onCreate(options) {
        this.setState(new MainRoomState_1.MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;
        this.onMessage("createWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            const mnemonic = bip39.generateMnemonic();
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
            const wallet = StellarHDWallet.fromMnemonic(msg.mnemonic);
            const secretKey = wallet.getSecret(0);
            const pair = stellar_sdk_1.Keypair.fromSecret(secretKey);
            client.send("connectWallet", {
                publicKey: pair.publicKey(),
                secretKey: secretKey,
                mnemonic: msg.mnemonic
            });
            client.send("systemMessage", "Wallet connected!");
        }));
        this.onMessage("payService", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            client.send("payService", {
                publicKey: "GA7K4RFFZ2EJXLCYVGQJU7PUKTEHKGQW6UAQXWEE6BDWN26HEJAQYDSF",
                price: 100,
            });
        }));
        this.onMessage("login", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            const userToLogin = yield (0, dbUtils_1.getUser)(msg.login);
            if (userToLogin) {
                if (yield bcrypt.compare(msg.password, userToLogin.password)) {
                    client.send("connectWallet", {
                        publicKey: userToLogin.publicId,
                        secretKey: userToLogin.secretId,
                        mnemonic: userToLogin.mnemonic
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
        this.onMessage("register", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            const userExists = yield (0, dbUtils_1.getUser)(msg.login);
            if (userExists) {
                client.send("systemMessage", "Username already exists");
            }
            else {
                const mnemonic = bip39.generateMnemonic();
                const wallet = StellarHDWallet.fromMnemonic(mnemonic);
                const publicKey = wallet.getPublicKey(0);
                const secretKey = wallet.getSecret(0);
                yield (0, dbUtils_1.initUser)(msg.login, yield bcrypt.hash(msg.password, saltRounds), publicKey, secretKey, mnemonic);
                client.send("systemMessage", "User created, login to see your public wallet");
            }
        }));
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
