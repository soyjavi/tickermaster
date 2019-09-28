import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { Store } from '../common';
import time from './modules/time';

dotenv.config();
const { METALS_API_KEY } = process.env || {};
const url = `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}`;

export default async () => {
  const { now, date, hour } = time();
  console.log(`[🤖:metals] ${date}-${hour} searching new rates ...`);

  try {
    const response = await fetch(url);
    if (response) {
      let { rates: metals } = await response.json();

      if (metals) {
        Object.keys(metals).forEach(symbol => metals[symbol] = parseFloat(metals[symbol].toFixed(4)));
        const store = new Store({ filename: date.substr(0, 7) });
        let rates = store.read();

        rates[date] = rates[date] ? rates[date] : {};
        rates[date][hour] = rates[date][hour] ? rates[date][hour] : {};
        rates[date][hour] = { ...rates[date][hour], ...metals };
        store.write(rates);

        console.log(`[🤖:metals] ${date}-${hour} found ${Object.keys(metals).length} new rates...`);
      }
    }
  } catch (error) {
    console.log('[🤖:metals] error:', error);
  }

};
