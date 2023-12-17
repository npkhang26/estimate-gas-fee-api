import { HexString , AptosClient, AptosAccount, TxnBuilderTypes, CoinClient} from "aptos";

const TXN_QUERY = {
    start : 0,
    limit: 1
}
const SIMULATE_QUERY = {
    estimateGasUnitPrice: true,
    estimateMaxGasAmount: true,
    estimatePrioritizedGasUnitPrice: false
}
let recent_simulate = {
    "gas_used" : '6',
    "max_gas_amount" : '2000000',
    "gas_unit_price" : '100'
};
async function simulateTransaction (fromAddress, toAddress, amount, isTestnet) {
    try {
        const NETWORK = isTestnet ? 'testnet' : 'mainnet';
        const NODE_URL = `https://fullnode.${NETWORK}.aptoslabs.com`;
        const client = new AptosClient(NODE_URL);
        const coinClient = new CoinClient(client);

        let senderAccountTxn = await client.getAccountTransactions(fromAddress, TXN_QUERY);
        if(! senderAccountTxn[0]) {
            let senderBalance = await coinClient.checkBalance(fromAddress);
            senderBalance = parseFloat(senderBalance)/Math.pow(10,8);
            if (senderBalance <= amount) {
                throw new Error("Move abort in 0x1::coin: EINSUFFICIENT_BALANCE(0x10006): Not enough coins to complete transaction");
            }
            return [{
                "success" : true,
                "gas_used" : recent_simulate["gas_used"],
                "max_gas_amount" : recent_simulate["max_gas_amount"],
                "gas_unit_price" : recent_simulate["gas_unit_price"],
                "msg" : 'first_transaction'
            }];
        }
        let senderPublicKey = senderAccountTxn[0]["signature"]["public_key"];
        let senderPublicKeyBytes = new TxnBuilderTypes.Ed25519PublicKey(new HexString(senderPublicKey).toUint8Array());
        let senderAccount = new AptosAccount(undefined, fromAddress);
    
        let payload = {
            type: "entry_function_payload",
            function: "0x1::aptos_account::transfer_coins",
            type_arguments: [
                "0x1::aptos_coin::AptosCoin"
            ],
            arguments: [
                toAddress,
                amount*Math.pow(10, 8)
            ],
        };
        let rawTxn = await client.generateTransaction(senderAccount.address(), payload);    
        let simulation = await client.simulateTransaction(senderPublicKeyBytes, rawTxn, SIMULATE_QUERY);
        recent_simulate = {
            "gas_used" : simulation[0]["gas_used"],
            "max_gas_amount" : simulation[0]["max_gas_amount"],
            "gas_unit_price" : simulation[0]["gas_unit_price"]
        };
        return simulation;
    } catch (e) {
        throw e;
    }
}
export {simulateTransaction};


// const SENDER_ADDRESS = "0x7b16562182ddcbe1f3196a0f7481b14865ab18bc687f8df45f1ffa845d0073d6";
// const RERCEIVER_ADDRESS = "0x92b2dccea648a4ce7873390327d36c2177eabae2c3280761bfd9e2dccf154607";
// const payload2 = {
//     type: "entry_function_payload",
//     function: "0x1::coin::transfer",
//     type_arguments: [
//         "0x1::aptos_coin::AptosCoin"
//     ],
//     arguments: [
//         RERCEIVER_ADDRESS, 
//         10000
//     ],
// };