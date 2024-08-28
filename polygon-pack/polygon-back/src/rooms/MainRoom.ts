import { Client, Room } from "colyseus";
import { MainRoomState, Player } from "./schema/MainRoomState";
import { getUser, initUser, saveUserToDb } from "../db/dbUtils";
import { createPolygonAccount, polygonBalance, polygonDeposit, polygonReward, polygonWithdraw, setupPolygonOptions } from "open-gamefi";
import { contractABI } from "../globals";
const bcrypt = require('bcrypt');

const saltRounds = 10;

export class MainRoom extends Room<MainRoomState> {
    onCreate(options: any) {
        setupPolygonOptions(process.env.JSON_RPC, contractABI, process.env.CONTRACT_ADDRESS, 100000, 50);
        this.setState(new MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;

        setInterval(()=>{
            this.state.users.forEach((player: Player)=>{
                if (player.user != undefined && player.client != undefined) {
                    player.currency += player.generators * (1+player.user.reward);
                    player.client.send("updateClicker",{
                        currency: player.currency,
                        generators: player.generators,
                        generatorPrice: this.getGeneratorCost(player.generators),
                        rewards: player.user.reward,
                        nftActive: player.user.nft
                    })
                }
            })
        },1000)

        this.onMessage("createWallet", async (client, msg) => {
            // This creates a mnemonic phrase first
            const newAccount = await createPolygonAccount();

            client.send("createWallet", { 
                publicKey: newAccount.publicKey,
                secret: newAccount.secretKey,
                mnemonic: newAccount.mnemonic
            })
            client.send("systemMessage","Wallet created!");
        })

        this.onMessage("login", async (client, msg) => {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user == undefined) {
                const userToLogin = await getUser(msg.login);
                client.send("systemMessage","Logging in process...");
                if (userToLogin) {
                    // sent password is compared using bcrypt with the one in database
                    if (await bcrypt.compare(msg.password, userToLogin.password)) {
                        userState.user = userToLogin;
                        userState.currency = userToLogin.currency;
                        userState.generators = userToLogin.generators;
                        const now = new Date();
                        userState.currency += Math.ceil(((now.getTime() - userState.user.lastPresence.getTime())/1000) * (userState.generators) * (1 + userState.user.reward));
                        userState.user.lastPresence = now;
                        await saveUserToDb(userState.user);
                        client.send("connectWallet",{
                            publicKey: userToLogin.publicId,
                            secretKey: userToLogin.secretId,
                            mnemonic: userToLogin.mnemonic,
                            balance: await polygonBalance(userToLogin.secretId)
                        });
                        client.send("updateClicker",{
                            currency: userState.currency,
                            generators: userState.generators,
                            generatorPrice: this.getGeneratorCost(userState.generators),
                            rewards: userState.user.reward,
                            nftActive: userState.user.nft
                        });
                        client.send("systemMessage","Login Successful!");
                    } else {
                        client.send("systemMessage","Username or password is wrong");
                    }
                } else {
                    client.send("systemMessage","Username or password is wrong");
                }
            }
        });

        this.onMessage("withdrawWallet", async (client, msg) => {
            client.send("systemMessage","Withdrawing...");
            const res = await polygonWithdraw(msg.secret, Number(msg.amount));
            client.send("balanceUpdate",{balance: res, systemMessage: "Withdraw success!"});
        });

        this.onMessage("depositWallet", async (client, msg) => {
            client.send("systemMessage","Depositing...");
            const res = await polygonDeposit(msg.secret, Number(msg.amount));
            client.send("balanceUpdate",{balance: res, systemMessage: "Deposit success!"});
        });

        this.onMessage("rewardWallet", async (client, msg) => {
            client.send("systemMessage","Rewarding...");
            const res = await polygonReward(msg.secret, 1);
            const balance = await polygonBalance(msg.secret);
            let userState = this.state.users.get(client.sessionId);
            userState.user.reward = res;
            await saveUserToDb(userState.user);
            client.send("balanceUpdate",{balance: balance, systemMessage: `Reward success! You have ${res} rewards!`});
        });

        this.onMessage("register", async (client, msg) => {
            const userExists = await getUser(msg.login);
            if (userExists) {
                client.send("systemMessage","Username already exists");
            } else {
                const newAccount = await createPolygonAccount();
                await initUser(msg.login,await bcrypt.hash(msg.password, saltRounds),newAccount.publicKey,newAccount.secretKey,newAccount.mnemonic);
                client.send("systemMessage","User created, login to see your public wallet");
            }
        })

        this.onMessage("click", async (client, msg) => {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user != undefined) {
                userState.currency+=(1 + userState.user.reward) * (userState.user.nft ? Math.max(1,userState.user.generators) : 1);
                client.send("updateClicker",{
                    currency: userState.currency,
                    generators: userState.generators,
                    generatorPrice: this.getGeneratorCost(userState.generators),
                    rewards: userState.user.reward,
                    nftActive: userState.user.nft
                })
            }
        })

        this.onMessage("buyGenerator", async (client, msg) => {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user != undefined) {
                if (userState.currency >= this.getGeneratorCost(userState.generators)) {
                    userState.currency -= this.getGeneratorCost(userState.generators);
                    userState.generators++;
                }
                client.send("updateClicker",{
                    currency: userState.currency,
                    generators: userState.generators,
                    generatorPrice: this.getGeneratorCost(userState.generators),
                    rewards: userState.user.reward,
                    nftActive: userState.user.nft
                })
            }
        })
    }

    async setUp(room: Room) {
        try {
            console.log("Setting up lobby room...");
        } catch (error) {
            console.error("Error in createImage handler:", error);
        }
    }

    async onJoin(client: Client, options: any) {
        if (!(this.state.users.has(client.sessionId))) {
            const player = new Player(client);
            this.state.users.set(client.sessionId,player);
        }
        console.log("Joined lobby room successfully...");
    }

    async onLeave(client: Client, consented: boolean) {
        if (this.state.users.has(client.sessionId)) {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user != undefined) {
                userState.user.currency = userState.currency;
                userState.user.generators = userState.generators;
                userState.user.lastPresence = new Date();
                await saveUserToDb(userState.user);
            }
            this.state.users.delete(client.sessionId)
        }
        console.log("Leaving lobby room successfully...");
    }

    async onDispose() {
        console.log("Disposed lobby room successfully...");
    }

    getGeneratorCost(counter: number) {
        return Math.floor(10 * Math.pow(1.2,counter));
    }

}