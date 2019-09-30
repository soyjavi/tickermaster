import { C } from '../common';
import { exchange, getLatest, parseCurrency } from '../modules';

const { BASE_CURRENCY } = C;

export default (req, res) => {
  const { params: { baseCurrency } } = req;

  /*
    1. Control if it's a allowed baseCurrency (default USD)
    2. is it in cache?
    3. if is not USD, we should convert
    ?. cache value
  */

  // 2.
  const latest = getLatest();
  let { rates } = latest;

  // 3.
  if (baseCurrency !== BASE_CURRENCY) {
    const conversion = 1 / rates[baseCurrency];

    Object.keys(rates).forEach(symbol => rates[symbol] = exchange(symbol, rates[symbol], conversion));
    rates[BASE_CURRENCY] = parseCurrency(conversion);
  }

  res.json({
    baseCurrency,
    ...latest,
    rates,
  });
}
