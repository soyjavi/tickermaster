import PKG from '../../package.json';

import { cache, Store, time } from '../common';
import { getLatest } from './modules';

export default (req, res) => {
  const { now } = time();
  const { rates, date, hour } = getLatest();
  const errors = new Store({ filename: 'errors' });

  res.json({
    version: PKG.version,
    now,
    latest: {
      date,
      hour,
      values: Object.keys(rates).length,
    },
    errors,
    cache: cache.status,
  });
};
