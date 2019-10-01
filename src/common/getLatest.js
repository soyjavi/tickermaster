import time from './time';
import Store from './store';

export default () => {
  const { date } = time();
  const store = new Store({ filename: date.substr(0, 7) });
  const rates = store.read();

  const hour = Object.keys(rates[date])
    .sort()
    .reverse()
    .find((item) => Object.keys(rates[date][item]).length > 168);

  return {
    date,
    hour,
    rates: rates[date][hour],
  };
};
