"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectWallet = exports.createWallet = void 0;
const stellar_sdk_1 = require("stellar-sdk");
const createWallet = () => {
    const pair = stellar_sdk_1.Keypair.random();
    return {
        publicKey: pair.publicKey(),
        secret: pair.secret(),
    };
};
exports.createWallet = createWallet;
const connectWallet = (secret) => {
    const pair = stellar_sdk_1.Keypair.fromSecret(secret);
    return pair.publicKey();
};
exports.connectWallet = connectWallet;
