import fetch from 'node-fetch';

import {
  C, cache, ERROR, Store,
} from '../common';
import { storeLatest } from './modules';

const { BASE_CURRENCY, CRYPTOS, URL } = C;
const HEADER = '[🤖:cryptos]';

const fetchService = async (latest, symbol) => {
  const url = latest
    ? `${URL.CRYPTOS}/pricemulti?tsyms=${BASE_CURRENCY}&fsyms=${CRYPTOS.join(',')}`
    : `${URL.CRYPTOS}/v2/histoday?fsym=${symbol}&tsym=${BASE_CURRENCY}&limit=2000`;
  console.log(`🔎 ${HEADER} fetching ${url}`);

  const response = await fetch(url);
  if (!response) throw Error('Can not fetch data.');

  const json = await response.json();
  if (json.Response === 'Error') throw Error(json.Message);

  return json;
};

export default async (latest = true) => {
  cache.wipe();

  try {
    if (latest) {
      const rates = await fetchService(latest);
      if (Object.keys(rates).length === 0) throw Error('Rates not found.');
      storeLatest(rates);
      console.log(`✔️  ${HEADER} found ${Object.keys(rates).length} new rates.`);
    } else {
      CRYPTOS.reduce((prev, symbol) => prev.then(async () => {
        const { Data: { Data: rates = [] } = {} } = await fetchService(latest, symbol);
        if (rates.length === 0) throw Error(`Rates not found for ${symbol}.`);

        rates.forEach(({ time: timestamp, close }) => {
          const key = (new Date(timestamp * 1000)).toISOString().substr(0, 10);
          const store = new Store({ filename: key.substring(0, 4) });
          const rows = store.read();

          store.write({ ...rows, [key]: { ...rows[key], [symbol]: close } });
        });

        console.log(`✔️  ${HEADER} found ${symbol} ${Object.keys(rates).length} new rates.`);
      }), Promise.resolve());
    }
  } catch ({ message }) { ERROR.store(`${HEADER} ${message}`); }
};
