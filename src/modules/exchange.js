import { C } from '../common';
import parseCurrency from './parseCurrency';

const { CRYPTOS } = C;
const ASSETS = [...(CRYPTOS.split(',')), 'XAU', 'XAG'];

export default (symbol, value, conversion) =>
  parseCurrency(ASSETS.includes(symbol) ? value / conversion : value * conversion);
