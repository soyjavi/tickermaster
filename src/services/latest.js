import {
  C, cache, ERROR, parseCurrency, time, Store,
} from '../common';

const { BASE_CURRENCY, SYMBOLS } = C;

export default (req, res) => {
  const { originalUrl, params: { baseCurrency } } = req;
  const { date } = time();

  // 1. Control if it's a allowed baseCurrency (default USD)
  if (!SYMBOLS.includes(baseCurrency)) return ERROR.NOT_FOUND(res);

  // 2. Get values
  const store = new Store({ filename: 'latest' });
  let rates = store.read();
  const hour = Object.keys(rates[date])
    .sort()
    .reverse()
    .find((item) => Object.keys(rates[date][item]).length > (SYMBOLS.length - 10));

  rates = rates[date][hour];

  // 3. Convert if is not default base currency
  if (baseCurrency !== BASE_CURRENCY) {
    const conversion = 1 / rates[baseCurrency];

    Object.keys(rates).forEach((symbol) => {
      rates[symbol] = parseCurrency(rates[symbol] * conversion);
    });
    rates[BASE_CURRENCY] = parseCurrency(conversion);
  }

  // 4. cache & response
  const response = {
    baseCurrency,
    date,
    hour,
    rates,
  };
  cache.set(originalUrl, response);
  return res.json(response);
};
