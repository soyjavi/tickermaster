import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import crons from './crons';
import { cache, error } from './middlewares';
import {
  backup, convert, latest, symbols, timeline,
} from './services';
import {
  chart, status,
} from './pages';
import PKG from '../package.json';

dotenv.config();

const { PORT = 3000, INSTANCE } = process.env;
const app = express();
const server = http.createServer(app);

// -- Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());

// -- Connections
global.connections = {};

// -- Statics
app.use('/static', express.static('assets'));
app.use('/static', express.static('dist'));

// -- Middlewares
app.get('/:baseCurrency/:symbol/:group', cache, timeline);
app.get('/:baseCurrency/latest', cache, latest);
app.get('/chart/:base/:symbol/:group', chart);
app.get('/convert/:baseCurrency/:amount/:symbol', cache, convert);
app.get('/symbols', cache, symbols);
app.get('/status', status);
app.get('/backup/:key', backup);

// -- Global Error Handler
app.use(error);

// -- Listen
const listener = server.listen(PORT, async () => {
  console.log(`☁️  API v${PKG.version} ${INSTANCE}:${listener.address().port}...`);

  crons.start();
});

process.on('uncaughtException', () => server.close());
