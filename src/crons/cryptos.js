import fetch from 'node-fetch';

import { C, Store, time } from '../common';

const { BASE_CURRENCY, CRYPTOS, URL } = C;
const url = `${URL.CRYPTOCOMPARE}?tsyms=${BASE_CURRENCY}&fsyms=${CRYPTOS}`;

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
      } else {

      }
    }
  } catch (error) {
    console.log('[🤖:cryptos] error:', error);
  }
};
