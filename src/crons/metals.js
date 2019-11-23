import dotenv from 'dotenv';
import fetch from 'node-fetch';

import {
  C, cache, ERROR, time,
} from '../common';
import { storeLatest } from './modules';

dotenv.config();
const { METALS_API_KEY } = process.env || {};
const { METALS, URL } = C;
const HEADER = '[🤖:metals]';

export default async () => {
  const { date, hour } = time();

  console.log(`[🤖:metals] ${date}-${hour} searching new rates ...`);
  cache.wipe();

  try {
    const keys = METALS_API_KEY.split(',');
    const api = keys[Math.floor(Math.random() * keys.length)];

    const url = `${URL.METALS}/latest?access_key=${api}&symbols=${METALS.join(',')}`;
    console.log(`🔎 ${HEADER} fetching ${url}`);

    const response = await fetch(url);
    if (!response) throw Error('Can not fetch data.');
    else {
      const { rates: metals = {} } = await response.json();

      if (!Object.keys(metals).length > 0) throw Error('Rates not found.');
      storeLatest(metals);
      console.log(`${HEADER} found ${Object.keys(metals).length} new rates...`);
    }
  } catch ({ message }) { ERROR.store(`${HEADER} ${message}`); }
};
