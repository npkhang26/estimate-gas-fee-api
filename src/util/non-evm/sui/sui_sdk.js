import {getFullnodeUrl, SuiClient} from '@mysten/sui.js/client';
import {TransactionBlock} from "@mysten/sui.js/transactions";
import {encodeStr} from "@mysten/bcs";

async function getTxnBytesBase64(fromAddress, toAddress, amount, isTestnet) {
    try {
        const NETWORK = (isTestnet) ? 'testnet' : 'mainnet';
        const client = new SuiClient({url: getFullnodeUrl(NETWORK)});

        let txb = new TransactionBlock();
        let amountToSplit = Math.round(amount).toString();
        let [coin] = txb.splitCoins(txb.gas, [txb.pure(amountToSplit)]);
        txb.transferObjects([coin], txb.pure(toAddress));
        txb.setSender(fromAddress);
        let txnArray = await txb.build({client});
        return encodeStr(txnArray, 'base64');
    } catch (e) {
        throw e;
    }
}

export {
    getTxnBytesBase64
};
