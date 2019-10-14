import fetch from 'node-fetch';
import { C, cache, Store } from '../common';

const { CRYPTOS, URL } = C;
const CACHE_1_DAY = 60 * 60 * 24;
const availableCryptos = CRYPTOS;

export default async (req, res) => {
  const { originalUrl } = req;

  const store = new Store({ filename: 'symbols' });
  let symbols = store.read() || {};
  res.json(symbols);

  // 1. Fetch & Merge crypto symbols
  const response = await fetch(`${URL.CRYPTOS}/all/coinlist`);
  if (response) {
    const { Data: cryptos = {} } = await response.json();
    Object.keys(cryptos)
      .filter((key) => availableCryptos.includes(key))
      .forEach((key) => {
        const { CoinName: name } = cryptos[key];
        symbols = { ...symbols, [key]: name };
      });
  }

  // 2. Cache
  store.write(symbols);
  cache.set(originalUrl, symbols, CACHE_1_DAY);
};
