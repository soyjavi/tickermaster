import { ERROR } from '../common';
import {
  exchange, parseCurrency, time, Store,
} from '../modules';

const GROUPS = ['H', 'D', 'W', 'M'];

export default (req, res) => {
  const { params: { baseCurrency, symbol, group } } = req;

  // 1. Control :symbol is valid

  // 2. Control :group is valid
  if (!GROUPS.includes(group)) ERROR.UNKNOWN_SERVICE(res);

  // 3. Determine files to check
  const { now, date, hour } = time();
  let rates = [];

  if (group === 'H') {
    const store = new Store({ filename: date.substr(0, 7) });
    rates = store.read();

    console.log(Object.keys(rates));
  }

  console.log('timeline');
  res.json({
    baseCurrency,
    symbol,
    group,
    now,
    rates,
  })
}
