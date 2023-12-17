import {Chain} from '../chain_model.js';
let chains;

async function FetchDB() {
    chains = await Chain.find({});
}

function getChain(chainID) {
    let result;
    for (const chain of chains) {
        if (chain.chainId === chainID) {
            result = chain;
            break;
        }
    }
    // set Avalanche Fuji from nonEVM to EVM
    if (result.chainId == '43113') 
        result.evm = true;
    return result;
}

export {FetchDB, getChain};