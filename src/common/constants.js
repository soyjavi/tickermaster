import dotenv from 'dotenv';

import PKG from '../../package.json';
import Store from './store';

dotenv.config();
const {
  BASE_CURRENCY,
  CACHE,
  URL_CURRENCIES,
  URL_METALS,
  URL_CRYPTOS,
} = process.env || {};
const { name, description, version } = PKG;
const store = new Store({ filename: 'symbols' });
const SYMBOLS = Object.keys(store.read());

let { CRYPTOS, METALS } = process.env || {};
CRYPTOS = CRYPTOS.split(',');
METALS = METALS.split(',');

const NO_CURRENCIES = [BASE_CURRENCY, ...CRYPTOS, ...METALS];
const CURRENCIES = SYMBOLS.filter((symbol) => !NO_CURRENCIES.includes(symbol));

export default {
  BASE_CURRENCY,

  CACHE,
  CURRENCIES,
  CRYPTOS,

  METALS,

  NO_CURRENCIES,

  PKG: { name, description, version },

  SYMBOLS,

  TIMELINE: {
    HOURLY: 'H',
    DAILY: 'D',
    WEEKLY: 'W',
    MONTHLY: 'M',
    // YEARLY: 'Y',
  },

  URL: {
    CRYPTOS: URL_CRYPTOS,
    CURRENCIES: URL_CURRENCIES,
    METALS: URL_METALS,
    SERVICE: 'https://tickermaster.glitch.me',
  },
};
