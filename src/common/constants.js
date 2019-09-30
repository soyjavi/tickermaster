import dotenv from 'dotenv';

dotenv.config();
const { BASE_CURRENCY, CRYPTOS } = process.env || {};

export default {
  BASE_CURRENCY,
  CRYPTOS,
  URL: {
    CRYPTOCOMPARE: 'https://min-api.cryptocompare.com/data/pricemulti',
    METALS: 'https://metals-api.com/api/latest',
  }
};
