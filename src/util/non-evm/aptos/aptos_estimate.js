import {} from 'node-fetch';
import {simulateTransaction} from './aptos_sdk.js';

async function apt_gasPrice(isTestnet) {
    try {
        const NETWORK = (isTestnet) ? 'testnet' : 'mainnet';
        const URL = `https://fullnode.${NETWORK}.aptoslabs.com/v1/estimate_gas_price`;

        let options = {method: 'GET'};
        let response = await fetch(URL, options);
        let data = await response.text();
        let gasPrice = JSON.parse(data);
        // deprioritized_gas_estimate, gas_estimate, prioritized_gas_estimate
        return gasPrice["gas_estimate"];
    } catch (e) {
        throw e;
    }
}

async function apt_estimateGas(fromAddress, toAddress, amount, isTestnet) {
    try {
        let simulation = await simulateTransaction(fromAddress, toAddress, amount, isTestnet);
        if (simulation[0]["success"] == false) {
            throw simulation[0]["vm_status"];
        }
        let gas_used = parseFloat(simulation[0]["gas_used"]);
        let max_gas_amount = parseFloat(simulation[0]["max_gas_amount"]);
        let upper_bound_gas = (gas_used*1.5 < max_gas_amount)? gas_used*1.5 : max_gas_amount;
        let gas_unit_price = parseFloat(simulation[0]["gas_unit_price"]);
        let data = {
            "gas": gas_used, 
            "gas_max":upper_bound_gas, 
            "gas_price":gas_unit_price
        }
        return data;
    } catch (e) {
        throw e;
    }
}

export {
    apt_gasPrice,
    apt_estimateGas
}
