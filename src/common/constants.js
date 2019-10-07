import dotenv from 'dotenv';

import PKG from '../../package.json';
import Store from './store';

dotenv.config();
const { BASE_CURRENCY, CACHE, CRYPTOS } = process.env || {};
const { name, description, version } = PKG;

const store = new Store({ filename: 'symbols' });
const SYMBOLS = Object.keys(store.read());

export default {
  BASE_CURRENCY,
  CACHE,
  CRYPTOS,
  PKG: { name, description, version },
  SYMBOLS,
  URL: {
    CRYPTOCOMPARE: 'https://min-api.cryptocompare.com/data',
    METALS: 'https://metals-api.com/api',
    SERVICE: 'https://tickermaster.glitch.me',
  },
};
