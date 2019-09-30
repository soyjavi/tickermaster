import time from './time';
import Store from './store';

export default (base) => {
  let { date } = time();
  const store = new Store({ filename: date.substr(0, 7) });
  const rates = store.read();

  const hour = Object.keys(rates[date])
    .sort()
    .reverse()
    .find(hour => Object.keys(rates[date][hour]).length > 168);

  return {
    date,
    hour,
    rates: rates[date][hour],
  };
}
