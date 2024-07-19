import { Client, Room } from "colyseus";
import { MainRoomState } from "./schema/MainRoomState";
import { createWallet } from "../walletUtils";
import { Keypair } from "stellar-sdk";
import { getUser, initUser } from "../db/dbUtils";
const bip39 = require('bip39');
const StellarHDWallet = require('stellar-hd-wallet');
const bcrypt = require('bcrypt');

const saltRounds = 10;

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
        })

        this.onMessage("payService", async (client, msg) => {
            client.send("payService", {
                publicKey: "GA7K4RFFZ2EJXLCYVGQJU7PUKTEHKGQW6UAQXWEE6BDWN26HEJAQYDSF",
                price: 100,
            });
        })

        this.onMessage("login", async (client, msg) => {
            const userToLogin = await getUser(msg.login);
            if (userToLogin) {
                if (await bcrypt.compare(msg.password, userToLogin.password)) {
                    client.send("connectWallet",{
                        publicKey: userToLogin.publicId,
                        secretKey: userToLogin.secretId,
                        mnemonic: userToLogin.mnemonic
                    });
                    client.send("systemMessage","Login Successful!");
                } else {
                    client.send("systemMessage","Username or password is wrong");
                }
            } else {
                client.send("systemMessage","Username or password is wrong");
            }
        })

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