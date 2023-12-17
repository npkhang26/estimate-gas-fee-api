# Introduction
- APIs for transaction gas fee estimation. 
- Supporting multichain both EVM and nonEVM (SUI, Aptos, NEO). 

# API Document
### GET: /gas-price
Query:
- chain_id: string chain ID (required)

Postman

    curl --location 'http://localhost:4000/gas-price?chain_id=1'

Response: 
- gas_price_wei : gas price in wei of chain
- chain : chain information


### GET: /estimate-gas-fee
#### For EVM chain:
Query:
- chain_id: string Chain ID (required)
- from_address: string Sender Address  (required)
- to_address: string (required)
    
    - In case estimating gas for a native token transaction, to_address will be the address of receiver

    - In case estimating gas for a token transaction (NOT native token), to_address will be the contract address of this token. Note that the API currently supports estimating gas fee with ERC-20 token only.

- amount: string amount to send (required)

Postman

    curl --location 'http://localhost:4000/estimate-gas-fee?chain_id=1&from_address=0xcb0574B4a0A0fD2004e391C0A3C43d7106Ba36eD&to_address=0x0d0e75A8Bfc833E400779af361281bd174891032&amount=0.03'

#### For SUI chain:
Query:
- chain_id: string Chain ID (required) : 101 for mainnet || 100 for testnet
- from_address: string Sender Address  (required)
- to_address: string (required)
- object_id: string object id (optional) 
    - eg. '0x9fbfee8bf82b3a4a9c581892d69bf6dbad7fb41d0ead4f320ec4994a427fc787'
- token_address: string token address if can not provide object id (optional)
    - eg.0x0444fefafd19fa7ad1d7688bd96e3d2d4a77896f3ea512f7de7283522c4604db::managed::MANAGED   
    - default : 0x2::sui::SUI
- amount: string amount to send (required)
- gas_budget: string  amount for gas budget (optional)

Postman

    curl --location 'http://localhost:4000/estimate-gas-fee?amount=0.1&chain_id=101&from_address=0x756201eef557b118cdfec8253774826962823046a55675fdf228295b5bc35867&to_address=0xa559818c6a8d20da51e2205c068346d4f829e531f7da4afc8033b96b0dc26f0c&is_token=true&gas_budget=1000000&token_address=0x0444fefafd19fa7ad1d7688bd96e3d2d4a77896f3ea512f7de7283522c4604db%3A%3Amanaged%3A%3AMANAGED'

Response: 
- from_address : sender address
- to_address : receiver address
- amount : amount for transaction 
- estimate_gas_wei : estimate gas fee in wei of transaction
- estimate_gas_native: estimate gas fee in native of transaction
- chain : chain information
- gas_range : additional field for Aptos chain (chain_id = 2), it includes:
- lower_bound_fee : (Octa) the less the sender of the transaction is charged. (the same as estimate_gas_wei) 
- upper_bound_fee:(Octa) the most the sender of the transaction is charged.
- gas_object : additional field for SUI chain, it includes:
    - computationCost
    - storageCost
    -  storageRebate
    - nonRefundableStorageFee
    
    And in this case, the estimate_gas_wei will be calculated by computationCost + storageCost - storageRebate


#### For other non-EVM chain (Aptos, NEO)
Query:
- chain_id: string Chain ID (required)
- from_address: string Sender Address  (required)
- to_address: string (required)
- amount: string amount to send (required)

Postman

    curl --location 'http://localhost:4000/estimate-gas-fee?from_address=NQ1u8FvQ3P77iWidwRg5Bum4BXPTZaZnK8&to_address=NNVSyLAyRV1ne6JcNcoqXYkMAqkbcT7yxz&amount=10000&chain_id=14'













