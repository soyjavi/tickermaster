import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { Store } from '../common';

dotenv.config();
const { METALS_API_KEY } = process.env || {};
const url = `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}`;

export default async () => {
  const now = new Date();
  const date = now.toISOString().substr(0, 10);
  const hour = parseInt(now.toISOString().substr(11, 2));

  console.log(`BOT:metals:${date}:${hour} searching new rates...`);

  const store = new Store({ filename: date.substr(0, 7) });

  let rates = store.read();
  rates[date] = rates[date] ? rates[date] : {};
  rates[date][hour] = rates[date][hour] ? rates[date][hour] : {};

  try {
    const response = await fetch(url);
    if (response) {
      const { rates: metals } = await response.json();

      if (metals) {
        rates[date][hour] = { ...rates[date][hour], ...metals };
        store.write(rates);
        console.log(`BOT:metals:${date}:${hour} ${Object.keys(metals).length} new rates...`);
      }
    }
  } catch (error) {
    console.log('ERROR:', error);
  }

};
