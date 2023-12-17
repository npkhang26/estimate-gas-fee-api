import {apt_gasPrice, apt_estimateGas} from './aptos/aptos_estimate.js';
import { sui_gasPrice, sui_dryRunTransactionBlock, sui_getOwnedObjects, sui_transferObject, sui_transferSui } from './sui/sui_estimate.js';
import { neo_estimateGas } from './neo/neo_estimate.js';

async function gasPrice(chainId, isTestnet) {
    try {
        switch (chainId) {
            case "2" : 
                let gasPrice_aptos = await apt_gasPrice(isTestnet);
                return gasPrice_aptos.toString();
            case "101": //sui mainet
            case "100": //sui testnet
                let gasPrice_sui = await sui_gasPrice(isTestnet);
                return gasPrice_sui.toString();
            case "14":
                return "1";
        }
    } catch (error) {
        throw error;
    }
}

async function sui_estimateFee(fromAddress, toAddress, objectId="", tokenAddress, amount, isTestnet, gasBudget='1000000') {
    try {
        // Get object if if pass token address
        let object_id = objectId;
        if (!object_id) {
            let objectId_response = await sui_getOwnedObjects(fromAddress, tokenAddress, isTestnet);
            object_id = objectId_response[0].data.objectId;
        }

        let txnBytes;
        if (tokenAddress == "0x2::sui::SUI") {
            let txnBytes_response = await sui_transferSui(fromAddress, toAddress, object_id, amount, isTestnet, gasBudget);
            txnBytes = txnBytes_response.txBytes;
        } else { 
            let txnBytes_response = await sui_transferObject(fromAddress, toAddress, object_id, isTestnet, gasBudget);
            txnBytes = txnBytes_response.txBytes;
        }   
        let suiEstimate = await sui_dryRunTransactionBlock(txnBytes, isTestnet);
        // let suiGasFee = parseFloat(suiEstimate["gas_object"]["computationCost"]) + parseFloat(suiEstimate["gas_object"]["storageCost"]) - parseFloat(suiEstimate["gas_object"]["storageRebate"]);
        let suiGasFee = parseFloat(suiEstimate["gas_object"]["computationCost"]) + parseFloat(suiEstimate["gas_object"]["storageCost"]);                
        let estimateGas = parseFloat(suiGasFee) / parseFloat(suiEstimate["gas_price"]);
        let data = {
            "gas_price" : suiEstimate["gas_price"],
            "gas" : estimateGas.toString(),
            "gas_fee_wei" : suiGasFee.toString(),
            "gas_fee_native" : (suiGasFee / Math.pow(10, 9)).toString(),
            "gas_object" : suiEstimate["gas_object"],
        }
        return data;
    } catch (e) {
        throw e;
    }
}

async function aptos_estimateFee(fromAddress, toAddress, amount, isTestnet) {
    try {
        let data = await apt_estimateGas(fromAddress, toAddress, amount, isTestnet);
        let lower_bound_fee = data["gas"]*data["gas_price"];
        let upper_bound_fee = data["gas_max"]*data["gas_price"];
        let gas_range = {
            "lower_bound_gas" : lower_bound_fee.toString(),
            "upper_bound_gas" : upper_bound_fee.toString()
        }
        let result = {
            "gas_price" : data["gas_price"].toString(),
            "gas" : data["gas"].toString(),
            "gas_fee_wei" : lower_bound_fee.toString(),
            "gas_fee_native" : (lower_bound_fee/ Math.pow(10, 8)).toString(),
            "gas_object" : gas_range,
        }
        return result;
    } catch (e) {
        throw e;
    }
}

async function neo_estimateFee(fromAddress, toAddress, amount, nodeUrl, isTestnet) {
    try {
        let data = await neo_estimateGas(fromAddress, toAddress, amount, nodeUrl, isTestnet);
        let result = {
            "gas_price" : "1",
            "gas" : data,
            "gas_fee_wei" : data,
            "gas_fee_native" : data,
        }
        return result;
    } catch (e) {
        throw e;
    }
}
export {
    gasPrice,
    sui_estimateFee,
    aptos_estimateFee,
    neo_estimateFee
}
