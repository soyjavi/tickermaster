import { C, ERROR } from '../common';
import {
  exchange, parseCurrency, time, Store,
} from '../modules';

const { BASE_CURRENCY } = C;
const GROUPS = ['H', 'D', 'W', 'M'];

const localExchange = (rates = {}, symbol, baseCurrency) => {
  let value = rates[symbol];

  if (baseCurrency !== BASE_CURRENCY) {
    const conversion = 1 / rates[baseCurrency]
    value = (symbol === BASE_CURRENCY) ? conversion : exchange(symbol, value, conversion);
  }

  return parseCurrency(value);
};

export default (req, res) => {
  const { params: { baseCurrency, symbol, group } } = req;
  let rates = {};

  // 1. Control :symbol is valid

  // 2. Control :group is valid
  if (!GROUPS.includes(group)) ERROR.UNKNOWN_SERVICE(res);

  // 3. Determine files to check
  const { now, date, hour } = time();

  // we should get last 2 files and join values
  const store = new Store({ filename: date.substr(0, 7) });
  let history = store.read();

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
          rates[(new Date(year, month, day, hour)).toISOString()] = value;
        })
      }

      else if (group === 'D') {
        const value = localExchange(history[date][hour], symbol, baseCurrency);
        rates[(new Date(year, month, day, hour)).toISOString()] = value;
      }

      else if (group === 'M') {
        const values = Object.keys(history[date])
          .map(hour => history[date][hour][symbol])
          .filter(value => value > 0)
          .sort((a, b) => a - b);

        const half = Math.floor(values.length / 2);

        let value = values.length % 2
            ? values[half]
            : (values[half - 1] + values[half]) / 2;


        console.log({
          date,
          values,
          half,
          value,
        })

        // value = localExchange(value, symbol, baseCurrency);
        rates[(new Date(year, month, day)).toISOString()] = value;
      }

      const length = Object.keys(rates).length;
      return ((group === 'H' && length > 24) || (group === 'D' && length > 31) || (group === 'M' && length > 12));
    });

  // Fullfill empty values with previous value
  let previousValue = 0;
  Object.keys(rates).forEach((value) => {
    rates[value] = rates[value] || previousValue;
    previousValue = rates[value]
  });

  res.json({
    baseCurrency,
    symbol,
    group,
    now,
    rates,
  })
}
