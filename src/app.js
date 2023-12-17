import express from 'express';
import { Connection } from './db_config.js'; 
import { router } from './routes.js';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import {FetchDB} from './contants/chains_fetch.js'

const app = express();
const port = 4000; 

Connection();
FetchDB().then(() => console.log("Successfully get chain information from database."));
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json() );
app.use('/', router);
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
