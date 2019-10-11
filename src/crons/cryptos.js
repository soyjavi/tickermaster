import fetch from 'node-fetch';

import {
  C, cache, Store, time,
} from '../common';

const { BASE_CURRENCY, CRYPTOS, URL } = C;

export default async () => {
  const { now, date, hour } = time();
  const errors = new Store({ filename: 'errors' });

  console.log(`[🤖:cryptos] ${date}-${hour} searching new rates ...`);
  cache.wipe();

  try {
    const response = await fetch(`${URL.CRYPTOCOMPARE}/pricemulti?tsyms=${BASE_CURRENCY}&fsyms=${CRYPTOS.join(',')}`);
    if (response) {
      const json = await response.json();

      if (Object.keys(json).length > 0) {
        const cryptos = {};
        Object.keys(json).forEach((symbol) => {
          cryptos[symbol] = json[symbol][BASE_CURRENCY];
        });

        const store = new Store({ filename: date.substr(0, 7) });
        const rates = store.read();

        rates[date] = rates[date] ? rates[date] : {};
        rates[date][hour] = rates[date][hour] ? rates[date][hour] : {};
        rates[date][hour] = { ...rates[date][hour], ...cryptos };
        store.write(rates);

        console.log(`[🤖:cryptos] ${date}-${hour} found ${Object.keys(cryptos).length} new rates...`);
      } else {
        throw Error('[🤖:metals] can not get rates');
      }
    }
  } catch (error) {
    console.log('[🤖:cryptos] error:', error);
    errors.write({ ...errors.read(), [now]: error });
  }
};
