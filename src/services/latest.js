import {
  C, cache, exchange, parseCurrency, time, Store,
} from '../common';

const { BASE_CURRENCY } = C;

export default (req, res) => {
  const { originalUrl, params: { baseCurrency } } = req;
  const { date } = time();

  // 1. Control if it's a allowed baseCurrency (default USD)

  // 2. Get values
  const store = new Store({ filename: date.substr(0, 7) });
  let rates = store.read();
  const hour = Object.keys(rates[date])
    .sort()
    .reverse()
    .find((item) => Object.keys(rates[date][item]).length > 168);

  rates = rates[date][hour];

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
    date,
    hour,
    rates,
  };
  cache.set(originalUrl, response);
  res.json(response);
};
