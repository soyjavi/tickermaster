import parseCurrency from './parseCurrency';

export default (symbol, value, conversion) => parseCurrency(
  value * conversion,
);
