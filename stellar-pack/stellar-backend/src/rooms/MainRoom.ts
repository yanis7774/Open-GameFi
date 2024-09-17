import { Client, Room } from "colyseus";
import { MainRoomState, Player } from "./schema/MainRoomState";
import { getUser, initUser, saveUserToDb } from "../db/dbUtils";
import { createStellarAccount, depositBalance, getBalance, getNftBalance, getStellarAccountFromMnemonic, upgradeWallet, withdrawBalance } from "open-gamefi";
const bcrypt = require('bcrypt');

const saltRounds = 10;
const payToPublicKey = "GA7K4RFFZ2EJXLCYVGQJU7PUKTEHKGQW6UAQXWEE6BDWN26HEJAQYDSF";

export class MainRoom extends Room<MainRoomState> {
    onCreate(options: any) {
        this.setState(new MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;

        setInterval(()=>{
            this.state.users.forEach((player: Player)=>{
                if (player.user != undefined && player.client != undefined) {
                    player.currency += player.generators[0];
                    this.updateClicker(player);
                }
            })
        },1000)

        this.onMessage("createWallet", async (client, msg) => {
            // This creates a mnemonic phrase first
            const newAccount = await createStellarAccount();

            client.send("createWallet", { 
                publicKey: newAccount.publicKey,
                secret: newAccount.secretKey,
                mnemonic: newAccount.mnemonic
            })
            client.send("systemMessage","Wallet created!");
        })

        this.onMessage("connectWallet", async (client, msg) => {
            // This connectes wallet from mnemonic phrase, not used for now
            const existingAccount = await getStellarAccountFromMnemonic(msg.mnemonic)
            client.send("connectWallet",{
                publicKey: existingAccount.publicKey,
                secretKey: existingAccount.secretKey,
                mnemonic: existingAccount.mnemonic,
                balance: await getBalance(existingAccount.secretKey)
            });
            client.send("systemMessage","Wallet connected!");
        });

        this.onMessage("payService", async (client, msg) => {
            // Sends a public key as payment receiver
            client.send("payService", {
                publicKey: payToPublicKey,
                price: 100,
            });
        });

        this.onMessage("logout", async (client, msg) => {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user != undefined) {
                userState.user.currency = userState.currency;
                userState.user.generators = userState.generators;
                userState.user.lastPresence = new Date();
                await saveUserToDb(userState.user);
            }
            userState.user = undefined;
        });

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
                        userState.currency += Math.ceil(((now.getTime() - userState.user.lastPresence.getTime())/1000) * (userState.generators[0]) * (5*userState.generators[1]) * (10*userState.generators[2]));
                        userState.user.lastPresence = now;
                        await saveUserToDb(userState.user);
                        client.send("connectWallet",{
                            publicKey: userToLogin.publicId,
                            secretKey: userToLogin.secretId,
                            mnemonic: userToLogin.mnemonic
                        });
                        client.send("systemMessage","Login Successful!");
                        client.send("balanceUpdate",{balance: await getBalance(userToLogin.secretId), systemMessage: "Balance updated!"});
                        if (process.env.NFT_ON == "true")
                            userState.user.nft = (await getNftBalance(userToLogin.secretId, process.env.NFT)) > 0;
                        else
                            userState.user.nft = false;
                        this.updateClicker(userState);
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
            const res = await withdrawBalance(msg.secret, Number(msg.amount));
            client.send("balanceUpdate",{balance: res, systemMessage: "Withdraw success!"});
        });

        this.onMessage("depositWallet", async (client, msg) => {
            console.log("DEPOSIT: ", msg);
            client.send("systemMessage","Depositing...");
            const res = await depositBalance(msg.secret, Number(msg.amount));
            client.send("balanceUpdate",{balance: res, systemMessage: "Deposit success!"});
        });

        this.onMessage("upgradeWallet", async (client, msg) => {
            client.send("systemMessage","Upgrading...");
            const res = await upgradeWallet(msg.secret, msg.index+1);
            const balance = await getBalance(msg.secret);
            let userState = this.state.users.get(client.sessionId);
            userState.user.paidGenerators[msg.index] = res;
            userState.paidGenerators[msg.index] = res;
            await saveUserToDb(userState.user);
            client.send("balanceUpdate",{balance: balance, systemMessage: `Upgrading success!`});
            this.updateClicker(userState);
        });

        this.onMessage("register", async (client, msg) => {
            client.send("systemMessage","Register in process...");
            console.log("Registering...");
            const userExists = await getUser(msg.login);
            if (userExists) {
                client.send("systemMessage","Username already exists");
            } else {
                const newAccount = await createStellarAccount();
                await initUser(msg.login,await bcrypt.hash(msg.password, saltRounds),newAccount.publicKey,newAccount.secretKey,newAccount.mnemonic);
                client.send("systemMessage","User created, login to see your public wallet");
            }
        })

        this.onMessage("click", async (client, msg) => {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user != undefined) {
                userState.currency+=userState.user.nft ? Math.max(1,this.getGeneratorValue(userState)) : 1;
                this.updateClicker(userState);
            }
        })

        this.onMessage("buyGenerator", async (client, msg) => {
            let userState = this.state.users.get(client.sessionId);
            if (userState.user != undefined) {
                if (userState.currency >= this.getGeneratorCost(userState.generators[msg.index],msg.index)) {
                    userState.currency -= this.getGeneratorCost(userState.generators[msg.index],msg.index);
                    userState.generators[msg.index]++;
                    this.updateClicker(userState);
                }
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

    getGeneratorCost(counter: number, index: number) {
        return Math.floor(10 * Math.pow(1.2,counter) * (1+100*index));
    }

    updateClicker(userState: Player) {
        userState.client.send("updateClicker",{
            currency: userState.currency,
            generators: userState.generators,
            paidGenerators: userState.paidGenerators,
            generatorPrice: [this.getGeneratorCost(userState.generators[0],0),this.getGeneratorCost(userState.generators[1],1),this.getGeneratorCost(userState.generators[2],2)],
            nftActive: userState.user.nft
        })
    }

    getGeneratorValue(userState: Player) {
        return (userState.generators[0]) * (5*userState.generators[1]) * (10*userState.generators[2])
    }

}