import {
  C, cache, ERROR, exchange, parseCurrency, time,
} from '../common';
import { getHistory, median } from './modules';

const { BASE_CURRENCY, CRYPTOS, SYMBOLS } = C;
const GROUPS = ['H', 'D', 'W', 'M'];
const ASSETS = [...(CRYPTOS.split(',')), 'XAU', 'XAG'];

const localExchange = (rates = {}, symbol, base) => {
  let value = rates[symbol];

  if (ASSETS.includes(symbol)) value = 1 / value;

  if (base !== BASE_CURRENCY) {
    const conversion = ASSETS.includes(base) ? rates[base] : 1 / rates[base];
    value = (symbol === BASE_CURRENCY) ? conversion : exchange(symbol, value, conversion);
  }

  return parseCurrency(value);
};

export default (req, res) => {
  const { originalUrl, params: { baseCurrency, symbol, group } } = req;

  // 1. Control :symbol is valid
  if (!SYMBOLS.includes(baseCurrency) || !SYMBOLS.includes(symbol)) return ERROR.NOT_FOUND(res);

  // 2. Control :group is valid
  if (!GROUPS.includes(group)) return ERROR.UNKNOWN_SERVICE(res);

  // 3. Determine files to check
  const { now } = time();
  const history = getHistory(group === 'M' ? 12 : 1);
  const rates = {};

  // 4. Process history
  let fulfilled = false;
  Object.keys(history)
    .sort()
    .reverse()
    .some((date) => {
      const [year, month, day] = date.split('-');

      if (group === 'H') {
        Object.keys(history[date])
          .sort()
          .reverse()
          .some((hour) => {
            const value = localExchange(history[date][hour], symbol, baseCurrency);
            rates[(new Date(year, month - 1, day, hour)).toISOString()] = value;
            fulfilled = Object.keys(rates).length >= 32;
            return fulfilled;
          });
      } else if (group === 'D') {
        const { hour } = time();
        const value = localExchange(history[date][hour], symbol, baseCurrency);
        rates[(new Date(year, month - 1, day, hour)).toISOString()] = value;
        fulfilled = Object.keys(rates).length >= 32;
      } else if (group === 'M') {
        const values = Object.keys(history[date])
          .map((hour) => localExchange(history[date][hour], symbol, baseCurrency));
        rates[(new Date(year, month - 1, day)).toISOString()] = parseCurrency(median(values));
        fulfilled = Object.keys(rates).length >= 365;
      }

      return fulfilled;
    });

  // 5. Fullfill empty values with previous value
  let previousValue = 0;
  Object.keys(rates).forEach((value) => {
    rates[value] = rates[value] || previousValue;
    previousValue = rates[value];
  });

  // 6. For WEEKLY & MONTHLY group


  // 7. determine low, high & progression
  const values = Object.values(rates);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const progression = (((values[0] * 100) / [values[values.length - 1]]) - 100).toFixed(2);

  // 7. cache & response
  const response = {
    baseCurrency,
    symbol,
    group,
    now,
    rates,
    low,
    high,
    progression,
  };
  cache.set(originalUrl, response);

  return res.json(response);
};
