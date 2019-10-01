import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { C, Store, time } from '../common';

dotenv.config();
const { METALS_API_KEY } = process.env || {};
const { URL } = C;

export default async () => {
  const { now, date, hour } = time();
  const errors = new Store({ filename: 'errors' });

  console.log(`[🤖:metals] ${date}-${hour} searching new rates ...`);

  try {
    const keys = METALS_API_KEY.split(',');
    const api = keys[Math.floor(Math.random() * keys.length)];
    const url = `${URL.METALS}?access_key=${api}`;
    const response = await fetch(url);

    if (response) {
      const { rates: metals = [] } = await response.json();

      if (Object.keys(metals).length > 0) {
        Object.keys(metals).forEach((symbol) => {
          metals[symbol] = parseFloat(metals[symbol].toFixed(4));
        });
        const store = new Store({ filename: date.substr(0, 7) });
        const rates = store.read();

        rates[date] = rates[date] ? rates[date] : {};
        rates[date][hour] = rates[date][hour] ? rates[date][hour] : {};
        rates[date][hour] = { ...rates[date][hour], ...metals };
        store.write(rates);

        console.log(`[🤖:metals] ${date}-${hour} found ${Object.keys(metals).length} new rates...`);
      } else {
        throw Error('[🤖:metals] can not get rates');
      }
    }
  } catch (error) {
    console.log('[🤖:metals] error:', error);
    errors.write({ ...errors.read(), [now]: error });
  }
};
