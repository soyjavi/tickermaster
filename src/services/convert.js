import {
  C, cache, ERROR, time, Store,
} from '../common';
import { calcExchange } from './modules';

const { BASE_CURRENCY, SYMBOLS } = C;

export default (req, res) => {
  const { originalUrl, params: { amount, base, symbol } } = req;
  const { date } = time();

  // 1. Control if it's base and symbol are allowed values
  if (!SYMBOLS.includes(base) || !SYMBOLS.includes(symbol)) return ERROR.NOT_FOUND(res);

  // 2. Get values
  const store = new Store({ filename: 'latest' });
  let rates = store.read();
  const hour = Object.keys(rates[date])
    .sort()
    .reverse()
    .find((item) => (
      (symbol === BASE_CURRENCY || rates[date][item][symbol])
      && (base === BASE_CURRENCY || rates[date][item][base])
    ));

  rates = rates[date][hour];

  // 3. If base currency is not the default one convert it
  const conversion = calcExchange(rates, symbol, base);

  // 4. Calculate the value with the amount
  const value = conversion * amount;

  // 5. cache & response
  const response = {
    base,
    symbol,
    amount,
    date,
    hour,
    value,
  };
  cache.set(originalUrl, response);

  return res.json(response);
};
