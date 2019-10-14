import {
  C, cache, ERROR, parseCurrency, time,
} from '../common';
import {
  calcExchange, getHistory, getWeek, median,
} from './modules';

const {
  CRYPTOS, METALS, SYMBOLS, TIMELINE,
} = C;
const CURRENT_WEEK = getWeek(new Date());
const GROUPS = Object.values(TIMELINE);
const SYMBOLS_LENGTH = SYMBOLS.length - METALS.length;
const {
  HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY,
} = TIMELINE;

export default (req, res) => {
  const { originalUrl, params: { baseCurrency, symbol, group } } = req;

  // 1. Control :symbol is valid
  if (!SYMBOLS.includes(baseCurrency) || !SYMBOLS.includes(symbol)) return ERROR.NOT_FOUND(res);

  // 2. Control :group is valid
  if (!GROUPS.includes(group)) return ERROR.UNKNOWN_SERVICE(res);

  // 3. Determine files to check
  const { now } = time();
  const history = getHistory(group);
  let rates = {};

  // 4. Process history
  const dates = Object.keys(history).sort().reverse();

  dates.some((date) => {
    const [year, month, day] = date.split('-');

    if (group === HOURLY) {
      Object.keys(history[date])
        .sort()
        .reverse()
        .some((hour) => {
          const value = calcExchange(history[date][hour], symbol, baseCurrency);
          rates[(new Date(year, month - 1, day, hour)).toISOString()] = value;

          return Object.keys(rates).length >= 32;
        });
    } else {
      const rate = history[date];

      if (Object.keys(history[date]).length < SYMBOLS_LENGTH) {
        const lastDate = dates.find((key) => Object.keys(history[key]).length === SYMBOLS_LENGTH);
        SYMBOLS
          .filter((key) => !CRYPTOS.includes(key))
          .forEach((key) => { rate[key] = history[lastDate][key]; });
      }

      rates[date] = calcExchange(rate, symbol, baseCurrency);
    }

    const { length } = Object.keys(rates);
    return (
      ((group === HOURLY || group === DAILY) && length > 32)
      || (group === WEEKLY && length > 224)
      || (group === MONTHLY && length > 976)
      || (group === YEARLY && length > 11692)
    );
  });

  // 5. WEEKLY || MONTHLY || YEARLY group
  if ([WEEKLY, MONTHLY, YEARLY].includes(group)) {
    const values = {};
    Object.keys(rates).forEach((date) => {
      let key;
      if (group === WEEKLY) key = CURRENT_WEEK - getWeek(date);
      else if (group === MONTHLY) key = date.substring(0, 7);
      else if (group === YEARLY) key = date.substring(0, 4);

      if (rates[date]) values[key] = [...(values[key] || []), rates[date]];
    });

    rates = {};
    const { year, month = 11, day } = time();
    let keys = Object.keys(values);
    if (group !== WEEKLY) keys = keys.sort().reverse();
    keys.forEach((key, index) => {
      let date;
      if (group === WEEKLY) date = new Date(year, month, day - (7 * index));
      else {
        const [keyYear, keyMonth = 11] = key.split('-');
        date = new Date(keyYear, keyMonth);
      }

      const medianValue = median(group === YEARLY ? values[key].slice(0, 30) : values[key]);
      if (medianValue) rates[date.toISOString()] = parseCurrency(medianValue);
    });
  }

  // 6. determine low, high & progression
  const values = Object.values(rates);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const progression = ((values[0] * 100) / [values[values.length - 1]]) - 100;

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
