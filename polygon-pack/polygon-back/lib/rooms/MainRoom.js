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
const dbUtils_1 = require("../db/dbUtils");
const open_gamefi_1 = require("open-gamefi");
const globals_1 = require("../globals");
const bcrypt = require('bcrypt');
const saltRounds = 10;
class MainRoom extends colyseus_1.Room {
    onCreate(options) {
        (0, open_gamefi_1.setupPolygonOptions)(process.env.JSON_RPC, globals_1.contractABI, process.env.CONTRACT_ADDRESS, 100000, 50);
        this.setState(new MainRoomState_1.MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;
        setInterval(() => {
            this.state.users.forEach((player) => {
                if (player.user != undefined && player.client != undefined) {
                    player.currency += player.generators * (1 + player.user.reward);
                    player.client.send("updateClicker", {
                        currency: player.currency,
                        generators: player.generators,
                        generatorPrice: this.getGeneratorCost(player.generators),
                        rewards: player.user.reward,
                        nftActive: player.user.nft
                    });
                }
            });
        }, 1000);
        this.onMessage("createWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            // This creates a mnemonic phrase first
            const newAccount = yield (0, open_gamefi_1.createPolygonAccount)();
            client.send("createWallet", {
                publicKey: newAccount.publicKey,
                secret: newAccount.secretKey,
                mnemonic: newAccount.mnemonic
            });
            client.send("systemMessage", "Wallet created!");
        }));
        this.onMessage("login", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user == undefined) {
                const userToLogin = yield (0, dbUtils_1.getUser)(msg.login);
                client.send("systemMessage", "Logging in process...");
                if (userToLogin) {
                    // sent password is compared using bcrypt with the one in database
                    if (yield bcrypt.compare(msg.password, userToLogin.password)) {
                        userState.user = userToLogin;
                        userState.currency = userToLogin.currency;
                        userState.generators = userToLogin.generators;
                        const now = new Date();
                        userState.currency += Math.ceil(((now.getTime() - userState.user.lastPresence.getTime()) / 1000) * (userState.generators) * (1 + userState.user.reward));
                        userState.user.lastPresence = now;
                        yield (0, dbUtils_1.saveUserToDb)(userState.user);
                        client.send("connectWallet", {
                            publicKey: userToLogin.publicId,
                            secretKey: userToLogin.secretId,
                            mnemonic: userToLogin.mnemonic,
                            balance: yield (0, open_gamefi_1.polygonBalance)(userToLogin.secretId)
                        });
                        client.send("updateClicker", {
                            currency: userState.currency,
                            generators: userState.generators,
                            generatorPrice: this.getGeneratorCost(userState.generators),
                            rewards: userState.user.reward,
                            nftActive: userState.user.nft
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
            }
        }));
        this.onMessage("withdrawWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            client.send("systemMessage", "Withdrawing...");
            const res = yield (0, open_gamefi_1.polygonWithdraw)(msg.secret, Number(msg.amount));
            client.send("balanceUpdate", { balance: res, systemMessage: "Withdraw success!" });
        }));
        this.onMessage("depositWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            client.send("systemMessage", "Depositing...");
            const res = yield (0, open_gamefi_1.polygonDeposit)(msg.secret, Number(msg.amount));
            client.send("balanceUpdate", { balance: res, systemMessage: "Deposit success!" });
        }));
        this.onMessage("rewardWallet", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            client.send("systemMessage", "Rewarding...");
            const res = yield (0, open_gamefi_1.polygonReward)(msg.secret, 1);
            const balance = yield (0, open_gamefi_1.polygonBalance)(msg.secret);
            let userState = this.state.users.get(client.sessionId);
            userState.user.reward = res;
            yield (0, dbUtils_1.saveUserToDb)(userState.user);
            client.send("balanceUpdate", { balance: balance, systemMessage: `Reward success! You have ${res} rewards!` });
        }));
        this.onMessage("register", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            const userExists = yield (0, dbUtils_1.getUser)(msg.login);
            if (userExists) {
                client.send("systemMessage", "Username already exists");
            }
            else {
                const newAccount = yield (0, open_gamefi_1.createPolygonAccount)();
                yield (0, dbUtils_1.initUser)(msg.login, yield bcrypt.hash(msg.password, saltRounds), newAccount.publicKey, newAccount.secretKey, newAccount.mnemonic);
                client.send("systemMessage", "User created, login to see your public wallet");
            }
        }));
        this.onMessage("click", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user != undefined) {
                userState.currency += (1 + userState.user.reward) * (userState.user.nft ? Math.max(1, userState.user.generators) : 1);
                client.send("updateClicker", {
                    currency: userState.currency,
                    generators: userState.generators,
                    generatorPrice: this.getGeneratorCost(userState.generators),
                    rewards: userState.user.reward,
                    nftActive: userState.user.nft
                });
            }
        }));
        this.onMessage("buyGenerator", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user != undefined) {
                if (userState.currency >= this.getGeneratorCost(userState.generators)) {
                    userState.currency -= this.getGeneratorCost(userState.generators);
                    userState.generators++;
                }
                client.send("updateClicker", {
                    currency: userState.currency,
                    generators: userState.generators,
                    generatorPrice: this.getGeneratorCost(userState.generators),
                    rewards: userState.user.reward,
                    nftActive: userState.user.nft
                });
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
            if (!(this.state.users.has(client.sessionId))) {
                const player = new MainRoomState_1.Player(client);
                this.state.users.set(client.sessionId, player);
            }
            console.log("Joined lobby room successfully...");
        });
    }
    onLeave(client, consented) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.users.has(client.sessionId)) {
                let userState = this.state.users.get(client.sessionId);
                if (userState.user != undefined) {
                    userState.user.currency = userState.currency;
                    userState.user.generators = userState.generators;
                    userState.user.lastPresence = new Date();
                    yield (0, dbUtils_1.saveUserToDb)(userState.user);
                }
                this.state.users.delete(client.sessionId);
            }
            console.log("Leaving lobby room successfully...");
        });
    }
    onDispose() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Disposed lobby room successfully...");
        });
    }
    getGeneratorCost(counter) {
        return Math.floor(10 * Math.pow(1.2, counter));
    }
}
exports.MainRoom = MainRoom;
