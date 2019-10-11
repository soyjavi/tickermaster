import { C, parseCurrency } from '../../common';

const { BASE_CURRENCY, CRYPTOS, METALS } = C;
const ASSETS = [...CRYPTOS, ...METALS];

export default (rates = {}, symbol, base) => {
  let value = rates[symbol];

  if (ASSETS.includes(symbol)) value = 1 / value;

  if (base !== BASE_CURRENCY) {
    const conversion = ASSETS.includes(base) ? rates[base] : 1 / rates[base];
    value = (symbol === BASE_CURRENCY) ? conversion : value * conversion;
  }

  return parseCurrency(value);
};
