import { CONST, rpc, sc, wallet, tx, u } from "@cityofzion/neon-core";

class NeoBuilder {
    constructor(fromaddress, toaddress, amount, nodeURL, isTestnet) {
        const NETWORK = isTestnet ? CONST.MAGIC_NUMBER.TestNet : CONST.MAGIC_NUMBER.MainNet;
        this.inputs = {
            fromAccount: new wallet.Account(fromaddress),
            toAccount: new wallet.Account(toaddress),
            tokenScriptHash: CONST.NATIVE_CONTRACT_HASH.NeoToken,
            amountToTransfer: amount,
            systemFee: 0,
            networkFee: 0,
            networkMagic: NETWORK,
            nodeUrl: nodeURL,
        };
        this.vars = {};
    };

    async createTransaction() {
        try {
            const rpcClient = new rpc.RPCClient(this.inputs.nodeUrl);
            // Since the token is now an NEP-17 token, we transfer using a VM script.
            const script = sc.createScript({
                scriptHash: this.inputs.tokenScriptHash,
                operation: "transfer",
                args: [
                    sc.ContractParam.hash160(this.inputs.fromAccount.address),
                    sc.ContractParam.hash160(this.inputs.toAccount.address),
                    this.inputs.amountToTransfer,
                    sc.ContractParam.any(),
                ],
            });
        
            // We retrieve the current block height as we need to
            const currentHeight = await rpcClient.getBlockCount();
            this.vars.tx = new tx.Transaction({
                signers: [
                    {
                        account: this.inputs.fromAccount.scriptHash,
                        scopes: tx.WitnessScope.CalledByEntry,
                    },
                ],
                validUntilBlock: currentHeight + 1000,
                script: script,
            });
        } catch (e) {
            throw e;
        }
    }
    
    async checkNetworkFee() {
        try {
            const rpcClient = new rpc.RPCClient(this.inputs.nodeUrl);
            const feePerByteInvokeResponse = await rpcClient.invokeFunction(
                CONST.NATIVE_CONTRACT_HASH.PolicyContract,
                "getFeePerByte"
            );
        
            if (feePerByteInvokeResponse.state !== "HALT") {
                if (this.inputs.networkFee === 0) {
                    throw new Error("Unable to retrieve data to calculate network fee.");
                } else {
                    // console.log("Unable to get information to calculate network fee.  Using user provided value.");
                    this.vars.tx.networkFee = u.BigInteger.fromNumber(this.inputs.networkFee);
                }
            }
            const feePerByte = u.BigInteger.fromNumber(
                feePerByteInvokeResponse.stack[0].value
            );
            // Account for witness size
            const transactionByteSize = this.vars.tx.serialize().length / 2 + 109;
            // Hardcoded. Running a witness is always the same cost for the basic account.
            const witnessProcessingFee = u.BigInteger.fromNumber(1000390);
            const networkFeeEstimate = feePerByte
                .mul(transactionByteSize)
                .add(witnessProcessingFee);
            if (this.inputs.networkFee && this.inputs.networkFee >= networkFeeEstimate.toNumber()) {
                this.vars.tx.networkFee = u.BigInteger.fromNumber(this.inputs.networkFee);
                // console.log(`i Node indicates ${networkFeeEstimate.toDecimal(8)} networkFee but using user provided value of ${this.inputs.networkFee}`);
            } else {
                this.vars.tx.networkFee = networkFeeEstimate;
            }
            return this.vars.tx.networkFee.toDecimal(8);
        } catch (e) {
            throw e;
        }
    }
}

export default NeoBuilder