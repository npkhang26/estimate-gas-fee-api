import NeoBuilder from './neo_sdk.js';

async function neo_estimateGas(fromAddress, toAddress, amount, nodeUrl, isTestnet) {
    const neoBuilder = new NeoBuilder(fromAddress, toAddress, amount, nodeUrl, isTestnet);
    await neoBuilder.createTransaction();
    let estimate_fee = await neoBuilder.checkNetworkFee();
    return estimate_fee;
}

export {neo_estimateGas}
// neo_estimateGas("NQ1u8FvQ3P77iWidwRg5Bum4BXPTZaZnK8", "NNVSyLAyRV1ne6JcNcoqXYkMAqkbcT7yxz", 1, "http://seed1.neo.org:20332", true).then((a)=>console.log(a));