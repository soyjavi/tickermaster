import {
  C, cache, ERROR, parseCurrency, time, Store,
} from '../common';

const { BASE_CURRENCY, SYMBOLS } = C;

export default (req, res) => {
  const { originalUrl, params: { amount, baseCurrency, symbol } } = req;
  const { date } = time();

  // 1. Control if it's baseCurrency and symbol are allowed values
  if (!SYMBOLS.includes(baseCurrency) || !SYMBOLS.includes(symbol)) return ERROR.NOT_FOUND(res);

  // 2. Get values
  const store = new Store({ filename: date.substr(0, 7) });
  const rates = store.read();
  const hour = Object.keys(rates[date])
    .sort()
    .reverse()
    .find((item) => Object.keys(rates[date][item]).length > 168);

  const latestRate = rates[date][hour];

  // 3. If base currency is not the default one convert it
  if (symbol !== BASE_CURRENCY) {
    const conversion = 1 / latestRate[symbol];
    latestRate[baseCurrency] = parseCurrency(latestRate[baseCurrency] * conversion);
    latestRate[BASE_CURRENCY] = parseCurrency(conversion);
  }

  // 4. Calculate the value with the amount
  const value = latestRate[baseCurrency] * amount;

  // 5. cache & response
  const response = {
    baseCurrency,
    symbol,
    amount,
    date,
    hour,
    value,
  };

  cache.set(originalUrl, response);
  res.json(response);
};
