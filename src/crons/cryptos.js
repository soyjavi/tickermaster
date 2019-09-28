import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { Store } from '../common';
import time from './modules/time';

dotenv.config();
const { BASE_CURRENCY, CRYPTOS } = process.env || {};
const url = `https://min-api.cryptocompare.com/data/pricemulti?tsyms=${BASE_CURRENCY}&fsyms=${CRYPTOS}`;

export default async () => {
  const { now, date, hour } = time();
  console.log(`[🤖:cryptos] ${date}-${hour} searching new rates ...`);

  try {
    const response = await fetch(url);
    if (response) {
      const json = await response.json();

      if (Object.keys(json).length > 0) {
        const cryptos = {};
        Object.keys(json).forEach(symbol => cryptos[symbol] = json[symbol][BASE_CURRENCY]);

        const store = new Store({ filename: date.substr(0, 7) });
        let rates = store.read();

        rates[date] = rates[date] ? rates[date] : {};
        rates[date][hour] = rates[date][hour] ? rates[date][hour] : {};
        rates[date][hour] = { ...rates[date][hour], ...cryptos };
        store.write(rates);

        console.log(`[🤖:cryptos] ${date}-${hour} found ${Object.keys(cryptos).length} new rates...`);
      }
    }
  } catch (error) {
    console.log('[🤖:cryptos] error:', error);
  }

};
