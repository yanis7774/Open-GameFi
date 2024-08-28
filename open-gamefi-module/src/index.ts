import { createStellarAccount, depositBalance, getBalance, getStellarAccountFromMnemonic, invokeContract, parseResponse, rewardWallet, setConversionRate, setWithdrawLimit, withdrawBalance, getNftBalance } from "./stellar"
import { createPolygonAccount, setupPolygonOptions, loadPolygonAccount, polygonDeposit, polygonWithdraw, polygonBalance, polygonReward, polygonRewardBalance } from "./polygon"

export {
    createStellarAccount,
    depositBalance,
    getBalance,
    getStellarAccountFromMnemonic,
    invokeContract,
    parseResponse,
    rewardWallet,
    setConversionRate,
    setWithdrawLimit,
    withdrawBalance,
    getNftBalance,
    createPolygonAccount,
    setupPolygonOptions,
    loadPolygonAccount,
    polygonRewardBalance,
    polygonReward,
    polygonBalance,
    polygonDeposit,
    polygonWithdraw,
}