import {
  C, cache, exchange, parseCurrency,
} from '../common';
import { getLatest } from './modules';

const { BASE_CURRENCY } = C;

export default (req, res) => {
  const { originalUrl, params: { baseCurrency } } = req;

  /*
    1. Control if it's a allowed baseCurrency (default USD)
    2. is it in cache?
    3. if is not USD, we should convert
    ?. cache value
  */

  // 2.
  const latest = getLatest();
  const { rates } = latest;

  // 3.
  if (baseCurrency !== BASE_CURRENCY) {
    const conversion = 1 / rates[baseCurrency];

    Object.keys(rates).forEach((symbol) => {
      rates[symbol] = exchange(symbol, rates[symbol], conversion);
    });
    rates[BASE_CURRENCY] = parseCurrency(conversion);
  }

  // 4. cache & response
  const response = {
    baseCurrency,
    ...latest,
    rates,
  };
  cache.set(originalUrl, response);
  res.json(response);
};
