import dotenv from 'dotenv';

import Store from './store';

dotenv.config();
const { BASE_CURRENCY, CACHE, CRYPTOS } = process.env || {};

const store = new Store({ filename: 'symbols' });
const SYMBOLS = Object.keys(store.read());

export default {
  BASE_CURRENCY,
  CACHE,
  CRYPTOS,
  SYMBOLS,
  URL: {
    CRYPTOCOMPARE: 'https://min-api.cryptocompare.com/data',
    METALS: 'https://metals-api.com/api',
  },
};
