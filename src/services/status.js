import PKG from '../../package.json';

import { getLatest, time } from '../common';

export default (req, res) => {
  const { now } = time();
  const { rates, date, hour } = getLatest();

  res.json({
    version: PKG.version,
    now,
    latest: {
      date,
      hour,
      values: Object.keys(rates).length,
    },
  })
};
