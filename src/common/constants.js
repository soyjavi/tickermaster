import dotenv from 'dotenv';

dotenv.config();
const { BASE_CURRENCY, CACHE, CRYPTOS } = process.env || {};

export default {
  BASE_CURRENCY,
  CACHE,
  CRYPTOS,
  URL: {
    CRYPTOCOMPARE: 'https://min-api.cryptocompare.com/data',
    METALS: 'https://metals-api.com/api',
  },
};
