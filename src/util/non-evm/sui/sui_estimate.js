import {} from 'node-fetch';
import {getTxnBytesBase64} from './sui_sdk.js';

async function sui_gasPrice(isTestnet) {
    const NETWORK = (isTestnet) ? 'testnet' : 'mainnet'; 
    const URL = `https://fullnode.${NETWORK}.sui.io:443`;

    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "suix_getReferenceGasPrice",
        params: []
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        let response = await fetch(URL, options);
        let data = await response.json();
        return data['result'];
    } catch (error) {
        throw error;
    }
}

async function sui_dryRunTransactionBlock(txnBytes, isTestnet) {
    try {
        const NETWORK = (isTestnet) ? 'testnet' : 'mainnet'; 
        const URL = `https://fullnode.${NETWORK}.sui.io:443`;
        // let txnBytes = await getTxnBytesBase64(fromAddress, toAddress, amount, isTestnet);
        const body = {
            jsonrpc: "2.0",
            id: 1,
            method: "sui_dryRunTransactionBlock",
            params: [txnBytes]
        }
        const options = {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        let response = await fetch(URL, options);
        let data = await response.json();

        if (data.error) throw new Error(data.error.message);
        return {
            "gas_object" : data["result"]["effects"]["gasUsed"],
            "gas_price" : data["result"]["input"]["gasData"]["price"],
        };
    } catch (error) {
        throw error;
    }
}

async function sui_getOwnedObjects(address, coinName, isTestnet) {
    const NETWORK = (isTestnet) ? 'testnet' : 'mainnet'; 
    const URL = `https://fullnode.${NETWORK}.sui.io:443`;
    let coinFilter = (coinName == "") ? [] : [{"StructType": `0x2::coin::Coin<${coinName}>`}];
    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "suix_getOwnedObjects",
        params: [
            address,
            {
                "filter": {
                    "MatchAll": coinFilter
                },
                "options": {
                  "showType": true,
                  "showOwner": true,
                  "showPreviousTransaction": true,
                  "showDisplay": false,
                  "showContent": false,
                  "showBcs": false,
                  "showStorageRebate": false
                }
            },
        ]
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        let response = await fetch(URL, options);
        let data = await response.json();
        if (data == undefined) throw new Error('Load owned object failed');
        return data['result'].data;
    } catch (error) {
        throw error;
    }
}

async function sui_transferObject (from_address, to_address, object_id, isTestnet, gas_budget='1000000') {
    const NETWORK = (isTestnet) ? 'testnet' : 'mainnet'; 
    const URL = `https://fullnode.${NETWORK}.sui.io:443`;
    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "unsafe_transferObject",
        params: [
            from_address,
            object_id,,
            gas_budget,
            to_address
        ]
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        let response = await fetch(URL, options);
        let data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.result;
    } catch (error) {
        throw error;
    }
}

async function sui_transferSui (from_address, to_address, object_id, amount, isTestnet, gas_budget='1000000') {
    const NETWORK = (isTestnet) ? 'testnet' : 'mainnet'; 
    const URL = `https://fullnode.${NETWORK}.sui.io:443`;
    let amountToSplit = Math.round(parseFloat(amount)).toString();
    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "unsafe_transferSui",
        params: [
            from_address,
            object_id,
            gas_budget,
            to_address,
            amountToSplit
        ]
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        let response = await fetch(URL, options);
        let data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.result;
    } catch (error) {
        throw error;
    }
}

// let a = await sui_getOwnedObjects("0x756201eef557b118cdfec8253774826962823046a55675fdf228295b5bc35867", "", false)
// let a = await sui_transferObject("0x756201eef557b118cdfec8253774826962823046a55675fdf228295b5bc35867", "0xa559818c6a8d20da51e2205c068346d4f829e531f7da4afc8033b96b0dc26f0c", "0x9fbfee8bf82b3a4a9c581892d69bf6dbad7fb41d0ead4f320ec4994a427fc787", false)
// let a = await sui_transferSui(
//     "0x756201eef557b118cdfec8253774826962823046a55675fdf228295b5bc35867",
//     "0xa559818c6a8d20da51e2205c068346d4f829e531f7da4afc8033b96b0dc26f0c",
//     "0x6522aa1a6279ff403d8c69a6878d28cdfdedc48e32070d197f8ab979e1fdb3de",
//     "0.1",
//     false
// );
// console.log(a);

export { sui_gasPrice, sui_dryRunTransactionBlock, sui_getOwnedObjects, sui_transferObject, sui_transferSui };