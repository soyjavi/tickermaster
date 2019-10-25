import {
  C, cache, ERROR, parseCurrency, time, Store,
} from '../common';

const {
  BASE_CURRENCY, CRYPTOS, METALS, SYMBOLS,
} = C;
const ASSETS = [...CRYPTOS, ...METALS];

export default (req, res) => {
  const { originalUrl, params: { base } } = req;
  const { date } = time();

  // 1. Control if it's a allowed base (default USD)
  if (!SYMBOLS.includes(base)) return ERROR.NOT_FOUND(res);

  // 2. Get values
  const store = new Store({ filename: 'latest' });
  let rates = store.read();
  const hour = Object.keys(rates[date])
    .sort()
    .reverse()
    .find((item) => Object.keys(rates[date][item]).length > (SYMBOLS.length - 10));

  rates = rates[date][hour];

  // 3. Convert if is not default base currency
  if (base !== BASE_CURRENCY) {
    const conversion = 1 / rates[base];

    Object.keys(rates).forEach((symbol) => {
      rates[symbol] = parseCurrency(ASSETS.includes(symbol) && !ASSETS.includes(base)
        ? rates[symbol] / conversion
        : rates[symbol] * conversion);
    });
    rates[BASE_CURRENCY] = parseCurrency(conversion);
  }

  // 4. cache & response
  const response = {
    base,
    date,
    hour,
    rates,
  };
  cache.set(originalUrl, response);
  return res.json(response);
};
