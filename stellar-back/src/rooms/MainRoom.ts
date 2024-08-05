import { Client, Room } from "colyseus";
import { MainRoomState } from "./schema/MainRoomState";
import { getUser, initUser } from "../db/dbUtils";
import { createStellarAccount, depositBalance, getBalance, getStellarAccountFromMnemonic, rewardWallet, withdrawBalance } from "open-gamefi-module";
//import { Server } from "@stellar/stellar-sdk/lib/horizon";
const bcrypt = require('bcrypt');

const saltRounds = 10;
const payToPublicKey = "GA7K4RFFZ2EJXLCYVGQJU7PUKTEHKGQW6UAQXWEE6BDWN26HEJAQYDSF";

export class MainRoom extends Room<MainRoomState> {
    onCreate(options: any) {
        this.setState(new MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;

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

        this.onMessage("login", async (client, msg) => {
            const userToLogin = await getUser(msg.login);
            client.send("systemMessage","Logging in process...");
            if (userToLogin) {
                // sent password is compared using bcrypt with the one in database
                if (await bcrypt.compare(msg.password, userToLogin.password)) {
                    client.send("connectWallet",{
                        publicKey: userToLogin.publicId,
                        secretKey: userToLogin.secretId,
                        mnemonic: userToLogin.mnemonic,
                        balance: await getBalance(userToLogin.secretId)
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
            const res = await withdrawBalance(msg.secret, Number(msg.amount));
            client.send("balanceUpdate",{balance: res, systemMessage: "Withdraw success!"});
        });

        this.onMessage("depositWallet", async (client, msg) => {
            client.send("systemMessage","Depositing...");
            const res = await depositBalance(msg.secret, Number(msg.amount));
            client.send("balanceUpdate",{balance: res, systemMessage: "Deposit success!"});
        });

        this.onMessage("rewardWallet", async (client, msg) => {
            client.send("systemMessage","Rewarding...");
            const res = await rewardWallet(msg.secret);
            const balance = await getBalance(msg.secret);
            client.send("balanceUpdate",{balance: balance, systemMessage: `Reward success! You have ${res} rewards!`});
        });

        this.onMessage("register", async (client, msg) => {
            const userExists = await getUser(msg.login);
            if (userExists) {
                client.send("systemMessage","Username already exists");
            } else {
                const newAccount = await createStellarAccount();
                await initUser(msg.login,await bcrypt.hash(msg.password, saltRounds),newAccount.publicKey,newAccount.secretKey,newAccount.mnemonic);
                client.send("systemMessage","User created, login to see your public wallet");
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
        console.log("Joined lobby room successfully...");
    }

    async onLeave(client: Client, consented: boolean) {
        console.log("Leaving lobby room successfully...");
    }

    async onDispose() {
        console.log("Disposed lobby room successfully...");
    }

}