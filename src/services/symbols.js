import fetch from 'node-fetch';
import { C, cache, Store } from '../common';

const { CRYPTOS, URL } = C;
const { METALS_API_KEY } = process.env || {};
const CACHE_1_DAY = 60 * 60 * 24;
const availableCryptos = CRYPTOS.split(',');

export default async (req, res) => {
  const { originalUrl } = req;

  const store = new Store({ filename: 'symbols' });
  let symbols = store.read() || {};
  res.json(symbols);

  // 2. Fetch & Merge metal symbols
  const keys = METALS_API_KEY.split(',');
  const api = keys[Math.floor(Math.random() * keys.length)];
  let response = await fetch(`${URL.METALS}/symbols?access_key=${api}`);
  if (response) {
    const metals = await response.json();

    Object.keys(metals).forEach((key) => {
      symbols = { ...symbols, [key]: { name: metals[key] } };
    });
  }

  // 3. Fetch & Merge crypto symbols
  response = await fetch(`${URL.CRYPTOCOMPARE}/all/coinlist`);
  if (response) {
    const { Data: cryptos = {} } = await response.json();
    Object.keys(cryptos)
      .filter((key) => availableCryptos.includes(key))
      .forEach((key) => {
        const { ImageUrl: image, CoinName: name } = cryptos[key];
        symbols = { ...symbols, [key]: { image: `https://www.cryptocompare.com${image}`, name } };
      });
  }

  store.write(symbols);
  cache.set(originalUrl, symbols, CACHE_1_DAY);
};
