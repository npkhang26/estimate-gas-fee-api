import { Router } from 'express';
import bodyParser from 'body-parser';
import * as controller from './controlller.js';

const router = Router();
router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json() );

router.get('/gas-price', controller.gasPrice);
router.get('/estimate-gas-fee', controller.estimateGasFee);

export {router};
