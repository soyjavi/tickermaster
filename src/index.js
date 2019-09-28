import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
// import prettyError from 'pretty-error';
// import { cacheCryptos, cacheCurrencies, cacheMetals } from './common';
import crons from './crons';

import {
  // cache, error,
  props,
  // request, response,
} from './middlewares';
import {
  status,
} from './services';
import PKG from '../package.json';

dotenv.config();
// prettyError.start();

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

// -- Middlewares
// app.use(request);
// app.get('/status', props, status);
// app.use(response);

// -- Global Error Handler
// app.use(error);

// -- Listen
const listener = server.listen(PORT, async () => {
  console.log(`☁️  API v${PKG.version} ${INSTANCE}:${listener.address().port}...`);

  crons.start();
});

process.on('uncaughtException', () => server.close());
