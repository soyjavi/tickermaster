import {
  C, cache, ERROR, time, Store,
} from '../common';
import { calcExchange } from './modules'

const { SYMBOLS } = C;

export default (req, res) => {
  const { originalUrl, params: { amount, baseCurrency, symbol } } = req;
  const { date } = time();

  // 1. Control if it's baseCurrency and symbol are allowed values
  if (!SYMBOLS.includes(baseCurrency) || !SYMBOLS.includes(symbol)) return ERROR.NOT_FOUND(res);

  // 2. Get values
  const store = new Store({ filename: date.substr(0, 7) });
  const rates = store.read();
  const hour = Object.keys(rates[date])
    .sort()
    .reverse()
    .find((item) => Object.keys(rates[date][item]).length > 168);

  const latestRate = rates[date][hour];

  // 3. If base currency is not the default one convert it
  const conversion = calcExchange(latestRate, symbol, baseCurrency);

  // 4. Calculate the value with the amount
  const value = conversion * amount;

  // 5. cache & response
  const response = {
    baseCurrency,
    symbol,
    amount,
    date,
    hour,
    value,
  };

  cache.set(originalUrl, response);
  res.json(response);
};
