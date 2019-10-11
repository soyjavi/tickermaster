import PKG from '../../package.json';

import {
  C, cache, getHistory, render, Store, time,
} from '../common';

import arrayToHtml from './modules/arrayToHtml';

const DIMENSION = 72;
const {
  CURRENCIES, CRYPTOS, METALS, URL: { SERVICE },
} = C;
const STATE = { ERROR: 1, INCOMPLETE: 2, COMPLETE: 3 };

const skeleton = () => {
  const {
    year, month, day, hour,
  } = time();

  const dataSource = {};
  Array.from({ length: DIMENSION }, (value, index) => {
    dataSource[(new Date(year, month, day, parseInt(hour, 10) - (index))).toISOString()] = STATE.ERROR;
  });

  return dataSource;
};

const intersect = (base, dataSource) => base.every((item) => dataSource.includes(item));

const renderService = (dataSource) => arrayToHtml(
  Object.keys(dataSource).map((timestamp) => {
    let color = 'red';
    if (dataSource[timestamp] === STATE.COMPLETE) color = 'green';
    else if (dataSource[timestamp] === STATE.INCOMPLETE) color = 'yellow';

    return render('templates/item-service-hour', { timestamp, color });
  }),
);

const renderCache = (keys) => arrayToHtml(
  Object.keys(keys)
    .filter((key) => key.substr(0, 5) !== 'page:')
    .map((key) => render('templates/item-cache', { SERVICE, key, seconds: keys[key] })),
);

const uptime = (dataSource) => {
  const keys = Object.keys(dataSource);
  const { length } = keys.filter((key) => dataSource[key] === STATE.COMPLETE);

  return ((length * 100) / DIMENSION).toFixed(2);
};

const healthy = (values = {}) => !Object.keys(values).some((key) => values[key] === STATE.INCOMPLETE);

export default (req, res) => {
  const { now } = time();
  const errors = new Store({ filename: 'errors' });
  const currencies = skeleton();
  const metals = skeleton();
  const cryptos = skeleton();

  const history = getHistory();
  let count = 0;
  Object.keys(history)
    .sort()
    .reverse()
    .some((date) => {
      const [year, month, day] = date.split('-');

      Object.keys(history[date])
        .sort()
        .reverse()
        .some((hour) => {
          const index = (new Date(year, month - 1, day, hour)).toISOString();
          const symbols = Object.keys(history[date][hour]);

          if (currencies[index]) currencies[index] = intersect(CURRENCIES, symbols) ? STATE.COMPLETE : STATE.INCOMPLETE;
          if (metals[index]) metals[index] = intersect(METALS, symbols) ? STATE.COMPLETE : STATE.INCOMPLETE;
          if (cryptos[index]) cryptos[index] = intersect(CRYPTOS, symbols) ? STATE.COMPLETE : STATE.INCOMPLETE;

          count += 1;
          return count > DIMENSION;
        });

      return count > DIMENSION;
    });

  const healthyServices = healthy(currencies) && healthy(metals) && healthy(cryptos);

  res.send(render('base', {
    page: render('status', {
      version: PKG.version,
      now,
      DIMENSION,
      color: healthyServices ? 'green' : 'yellow',
      state: healthyServices ? 'All services are online' : 'There is some partial degradation',
      cache: renderCache(cache.status.keys),
      currencies: renderService(currencies),
      currenciesUptime: uptime(currencies),
      metals: renderService(metals),
      metalsUptime: uptime(metals),
      cryptos: renderService(cryptos),
      cryptosUptime: uptime(cryptos),
      errors: JSON.stringify(errors.read()),
    }),
    role: 'status',
  }));
};
