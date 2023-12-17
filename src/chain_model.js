import { model } from 'mongoose';
import { Schema } from 'mongoose';

const ChainModel = new Schema({
  name: { type: String},
  logo: { type: String},
  evm: {type: Boolean},
  chainId: {type: String},
  symbol: { type: String},
  rpcHttp: { type: String},
  scan: { type: String},
  testnet: {type: Boolean},
});

export const Chain = model('Chain', ChainModel);