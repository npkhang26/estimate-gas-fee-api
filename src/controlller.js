import {EvmEstimate} from './util/evm_estimate.js';
import * as nonEvmEstimate from './util/non-evm/non_evm_estimate.js';
import {getChain} from './contants/chains_fetch.js'
import { query } from 'express';

// gasPrice
async function gasPrice(req, res) {
    let chain = getChain(req.query.chain_id);
    if (! chain) {
        const error = "Invalid Chain ID";
        return res.status(400).json({error});
    }
    let gasPrice = 0;
    if (! chain.evm) {
        try {
            gasPrice = await nonEvmEstimate.getGasPrice(req.query.chain_id, chain.testnet);
        } catch (error) {
            return res.status(400).json({error});
        }
    } else {
        let estimate = new EvmEstimate(chain.rpcHttp);
        gasPrice = await estimate.getGasPrice();
    }
    return res.json({"gas_price_wei": BigInt(gasPrice).toString(), "chain": chain});
};

// estimate Gas Fee
async function estimateGasFee(req, res) {
    try {
        if (!req.query.from_address) 
            return res.status(400).json({"error": "from_address is required."});
        if (!req.query.to_address) 
            return res.status(400).json({"error": "to_address is required."});
        if (!req.query.amount) 
            return res.status(400).json({"error": "amount is required."});
        let amount = req.query.amount;
        let chain = getChain(req.query.chain_id);
        if (! chain) 
            return res.status(400).json({"error" : "Invalid Chain ID"});
        // Non-evm Estimate
        if (! chain.evm) {
            let gasData;
            switch (req.query.chain_id) {
                case "101":  //SUI mainnet
                case "100":  //SUI testnet
                    let token_address = req.query.token_address ? req.query.token_address : "0x2::sui::SUI";
                    gasData = await nonEvmEstimate.sui_estimateFee(req.query.from_address, req.query.to_address, req.query.object_id, token_address, amount, chain.testnet, req.query.gas_budget);
                    break;
                case "2": //Aptos
                    gasData = await nonEvmEstimate.aptos_estimateFee(req.query.from_address, req.query.to_address, amount.toString(), chain.testnet);
                    break;
                case "14":
                    amount = parseInt(amount);
                    gasData = await nonEvmEstimate.neo_estimateFee(req.query.from_address, req.query.from_address, amount, chain.rpcHttp, chain.testnet);
                    break;
            }
            return res.json({
                "from_address": req.query.from_address,
                "to_address": req.query.to_address,
                "amount": amount,
                "gas_price" : gasData["gas_price"],
                "estimate_gas" : gasData["gas"],
                "estimate_gas_wei": gasData["gas_fee_wei"],
                "estimate_gas_native" : gasData["gas_fee_native"],
                "gas_data" : gasData["gas_object"],
                "chain": chain
            });
        }

        // EVM Estimate
        let estimate = new EvmEstimate(chain.rpcHttp);
        let isAddress = await estimate.checkIsAddress(req.query.to_address);  // check if second address is address or smart contract
        let data;
        if (isAddress == true)
            data = await estimate.getEstimateGasFee(req.query.from_address, req.query.to_address, req.query.amount);
        else data = await estimate.getSmartContractEstimateGasFee(req.query.from_address, req.query.to_address, req.query.amount);
        
        return res.json({
            "from_address": req.query.from_address,
            "to_address": req.query.to_address,
            "amount": amount,
            "gas_price" : data['gasPrice'].toString(),
            "estimate_gas" : data['estimateGas'].toString(),
            "estimate_gas_wei": BigInt(data['estimateFee']).toString(),
            "estimate_gas_native": estimate.weiToEth(data['estimateFee'].toString()),
            "chain": chain
        });
    } catch (e) {
        return res.status(400).json({"error": e.toString()});
    }
}

export {
    gasPrice,
    estimateGasFee,
}
