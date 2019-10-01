import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { C, Store, time } from '../common';

dotenv.config();
const { METALS_API_KEY } = process.env || {};
const { URL } = C;

export default async () => {
  const { date, hour } = time();
  console.log(`[🤖:metals] ${date}-${hour} searching new rates ...`);

  const keys = METALS_API_KEY.split(',');
  const api = keys[Math.floor(Math.random() * keys.length)];

  try {
    const url = `${URL.METALS}?access_key=${api}`;
    const response = await fetch(url);

    if (response) {
      let { rates: metals = [] } = await response.json();

      if (Object.keys(metals).length > 0) {
        Object.keys(metals).forEach(symbol => metals[symbol] = parseFloat(metals[symbol].toFixed(4)));
        const store = new Store({ filename: date.substr(0, 7) });
        let rates = store.read();

        rates[date] = rates[date] ? rates[date] : {};
        rates[date][hour] = rates[date][hour] ? rates[date][hour] : {};
        rates[date][hour] = { ...rates[date][hour], ...metals };
        store.write(rates);

        console.log(`[🤖:metals] ${date}-${hour} found ${Object.keys(metals).length} new rates...`);
      } else {
        console.log('>>>>>>', json);
      }
    }
  } catch (error) {
    console.log('[🤖:metals] error:', error);
  }
};
