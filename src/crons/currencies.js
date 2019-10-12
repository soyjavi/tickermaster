import fetch from 'node-fetch';

import {
  C, cache, ERROR, Store, time,
} from '../common';
import { storeLatest } from './modules';

const { BASE_CURRENCY, URL } = C;
const HEADER = '[🤖:currencies]';

export default async ({ latest, daily } = {}) => {
  cache.wipe();
  const {
    date, year, month, day,
  } = time();
  const startAt = (latest || daily)
    ? (new Date(year, month, day - 1)).toISOString().substring(0, 10)
    : '2000-01-01';

  try {
    const url = latest
      ? `${URL.CURRENCIES}/latest?base=${BASE_CURRENCY}`
      : `${URL.CURRENCIES}/history?start_at=${startAt}&end_at=${date}&base=${BASE_CURRENCY}`;
    console.log(`🔎 ${HEADER} fetching ${url}`);

    const response = await fetch(url);
    if (!response) throw Error('Can not fetch data.');

    if (response) {
      const { rates = {} } = await response.json();
      if (Object.keys(rates).length === 0) throw Error('Rates not found.');

      if (latest) storeLatest(rates);
      else {
        Object.keys(rates).forEach((key) => {
          const store = new Store({ filename: key.substring(0, 4) });
          const rows = store.read();

          store.write({ ...rows, [key]: { ...rows[key], ...rates[key] } });
        });
      }

      console.log(`✔️  ${HEADER} found ${Object.keys(rates).length} new rates.`);
    }
  } catch ({ message }) { ERROR.store(`${HEADER} ${message}`); }
};
