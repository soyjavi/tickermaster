import PKG from '../../package.json';

import { cache, Store, time } from '../common';

export default (req, res) => {
  const { now, date } = time();
  const errors = new Store({ filename: 'errors' });
  const store = new Store({ filename: date.substr(0, 7) });
  const rates = store.read();
  const hours = {};

  Object.keys(rates[date])
    .sort()
    .forEach((hour) => {
      hours[hour] = Object.keys(rates[date][hour]).length;
    });

  res.json({
    version: PKG.version,
    now,
    latest: {
      date,
      ...hours,
    },
    errors: errors.read(),
    cache: cache.status,
  });
};
