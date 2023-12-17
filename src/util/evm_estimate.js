import Web3 from 'web3';
import {ethers, parseEther}  from 'ethers';
import erc20_abi from '../contants/erc20_abi.js'

class EvmEstimate {
    constructor(JsonRpcProvider) {
        this.provider = new ethers.JsonRpcProvider(JsonRpcProvider);
        this.web3 = new Web3(new Web3.providers.HttpProvider(JsonRpcProvider));
    }

    async checkIsAddress(address) {
        let code = await this.web3.eth.getCode(address);
        if (code.length  > 2) return false;
        return true;
    }

    async getGasPrice() {
        try {
            let feeData = (await this.provider.getFeeData()).maxFeePerGas;
            return feeData;
        } catch (e) {
            throw e;
        }
    }
    
    async getEstimateGas(fromAddress, toAddress, amount) {
        try {
            let estimateGas = await this.provider.estimateGas({
                from: fromAddress,
                to: toAddress,
                gasLimit: "21000",
                value: parseEther(amount),
            })
            // let test = await this.web3.eth.estimateGas({
            //     from: fromAddress,
            //     to: toAddress,
            //     gasLimit: '21000',
            //     // value: parseEther(amount)
            //     value: this.web3.utils.toWei(amount, 'ether'),
            // })
            // console.log("gas ethers: " +  estimateGas);
            // console.log("gas web3: " +  test);
            return estimateGas;
        } catch (e) {
            throw e;
        }
    }
    
    async getEstimateGasFee(fromAddress, toAddress, amount) {
        try {
            let [gasPrice, estimateGas]  = await Promise.all([
                this.getGasPrice(), 
                this.getEstimateGas(fromAddress, toAddress, amount)
            ]);

            estimateGas = BigInt(21000);

            // DEBUG 
            // let price = await this.web3.eth.getGasPrice();
            // let gas = await this.web3.eth.estimateGas({
            //     from: fromAddress,
            //     to: toAddress,
            //     value: parseEther(amount)
            // })
            // console.log("fee: " + this.weiToEth((price*gas).toString()));

            let data = {
                'gasPrice' : gasPrice,
                'estimateGas' : estimateGas,
                'estimateFee' : gasPrice * estimateGas
            }
            return data;
        } catch (e) {
            throw e;
        }
    }
    
    async getSmartContractEstimateGas(fromAddress, contractAddress, amount) {
        try {
            const contract = new this.web3.eth.Contract(erc20_abi, contractAddress);
            let weiAmount = this.web3.utils.toWei(`${amount}`, 'ether');
            let estimateGas =  await contract.methods.transfer(contractAddress, weiAmount).estimateGas({from: fromAddress});

            // const erc20 = new ethers.Contract(contractAddress, erc20_abi, this.provider);
            // let estimateGas = await erc20.runner.estimateGas({
            //     to : to_address, 
            //     from: fromAddress,
            //     valuue : parseEther('0.2'),
            // });

            return estimateGas;
        } catch (e) {
            throw e;
        }
    }

    async getSmartContractEstimateGasFee(fromAddress, contractAddress, amount) {
        try {
            let [gasPrice, estimateGas ] = await Promise.all ([
                this.getGasPrice(), 
                this.getSmartContractEstimateGas(fromAddress, contractAddress, amount),
            ]);
            let data = {
                'gasPrice' : gasPrice,
                'estimateGas' : estimateGas,
                'estimateFee' : gasPrice * estimateGas
            }
            return data;
        } catch (e) {
            throw e;
        }
    }

    weiToEth(weiVaue) {
        return this.web3.utils.fromWei(weiVaue, 'ether');
    }    
}

export {EvmEstimate}

// let estimate = new EvmEstimate("https://goerli.infura.io/v3/570293beac8e4ff1844e320a9b6f39d9");
// let a = await estimate.getSmartContractEstimateGas("0xcb0574B4a0A0fD2004e391C0A3C43d7106Ba36eD", "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", 0.2)
// let a = await estimate.getSmartContractEstimateGas("0xcb0574B4a0A0fD2004e391C0A3C43d7106Ba36eD", "0x0d0enode75a8bfc833e400779af361281bd174891032", 0.02)
// console.log(a);

