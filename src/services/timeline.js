import {
  C, cache, ERROR, getHistory, parseCurrency, time,
} from '../common';
import { calcExchange, getWeek, median } from './modules';

const { SYMBOLS } = C;
const HOURLY = 'H';
const DAILY = 'D';
const WEEKLY = 'W';
const GROUPS = [HOURLY, DAILY, WEEKLY];
const CURRENT_WEEK = getWeek(new Date());

export default (req, res) => {
  const { originalUrl, params: { baseCurrency, symbol, group } } = req;

  // 1. Control :symbol is valid
  if (!SYMBOLS.includes(baseCurrency) || !SYMBOLS.includes(symbol)) return ERROR.NOT_FOUND(res);

  // 2. Control :group is valid
  if (!GROUPS.includes(group)) return ERROR.UNKNOWN_SERVICE(res);

  // 3. Determine files to check
  const { now } = time();
  const history = getHistory(group === WEEKLY ? 12 : 1);
  let rates = {};

  // 4. Process history
  let fulfilled = false;
  Object.keys(history)
    .sort()
    .reverse()
    .some((date) => {
      const [year, month, day] = date.split('-');

      if (group === HOURLY) {
        Object.keys(history[date])
          .sort()
          .reverse()
          .some((hour) => {
            const value = calcExchange(history[date][hour], symbol, baseCurrency);
            rates[(new Date(year, month - 1, day, hour)).toISOString()] = value;
            fulfilled = Object.keys(rates).length >= 32;
            return fulfilled;
          });
      } else if (group === DAILY || group === WEEKLY) {
        let key;
        let value;

        if (group === DAILY && Object.keys(rates).length === 0) {
          const { hour } = time();
          value = calcExchange(history[date][hour], symbol, baseCurrency);
          key = (new Date(year, month - 1, day, hour)).toISOString();
        } else {
          value = median(
            Object
              .keys(history[date])
              .map((hour) => calcExchange(history[date][hour], symbol, baseCurrency)),
          );
          key = (new Date(year, month - 1, day)).toISOString();
        }
        rates[key] = parseCurrency(value);

        const { length } = Object.keys(rates);
        fulfilled = group === DAILY ? length >= 32 : length >= 365;
      }

      return fulfilled;
    });

  // 5. Fullfill empty values with previous value
  let previousValue = 0;
  Object.keys(rates).forEach((value) => {
    rates[value] = rates[value] || previousValue;
    previousValue = rates[value];
  });

  // 6. For WEEKLY group
  if (group === WEEKLY) {
    const { year, month, day } = time();
    const weeks = [];
    Object.keys(rates).forEach((date) => {
      const weekIndex = CURRENT_WEEK - getWeek(date);
      weeks[weekIndex] = [...(weeks[weekIndex] || []), rates[date]];
    });

    rates = {};
    weeks.forEach((week, index) => {
      rates[(new Date(year, month, day - (7 * index))).toISOString()] = median(week);
    });
  }

  // 7. determine low, high & progression
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
