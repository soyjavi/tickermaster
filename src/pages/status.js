import PKG from '../../package.json';

import {
  C, cache, render, Store, time,
} from '../common';

import arrayToHtml from './modules/arrayToHtml';

const RESOLUTION = 72;
const {
  CURRENCIES, CRYPTOS, METALS, URL: { SERVICE },
} = C;
const ERROR = 1;
const INCOMPLETE = 2;
const COMPLETE = 3;

const skeleton = (resolution = RESOLUTION) => {
  const {
    year, month, day, hour,
  } = time();

  const dataSource = {};
  Array.from({ length: resolution }, (value, index) => {
    dataSource[(new Date(year, month, day, parseInt(hour, 10) - (index))).toISOString()] = ERROR;
  });

  return dataSource;
};

const state = (base, dataSource) => {
  const { length } = base.filter((key) => dataSource.includes(key));
  let value = ERROR;

  if (length === base.length) value = COMPLETE;
  else if (length !== 0) value = INCOMPLETE;

  return value;
};

const renderService = (dataSource) => arrayToHtml(
  Object.keys(dataSource).map((timestamp) => {
    let color = 'red';
    if (dataSource[timestamp] === COMPLETE) color = 'green';
    else if (dataSource[timestamp] === INCOMPLETE) color = 'yellow';

    return render('templates/item-service-hour', { timestamp, color });
  }),
);

const renderCache = (keys) => arrayToHtml(
  Object.keys(keys)
    .filter((key) => key.substr(0, 5) !== 'page:')
    .map((key) => render('templates/item-cache', {
      SERVICE,
      key,
      seconds: keys[key],
    })),
);

const renderErrors = () => {
  const store = new Store({ filename: 'errors' });
  const errors = store.read();

  return arrayToHtml(
    Object.keys(errors)
      .slice(-10)
      .reverse()
      .map((key) => render('templates/item-error', {
        error: errors[key],
        timestamp: (new Date(key)).toString().substr(0, 24),
      })),
  );
};

const uptime = (dataSource) => {
  const keys = Object.keys(dataSource);
  const { length } = keys.filter((key) => dataSource[key] === COMPLETE);

  return ((length * 100) / RESOLUTION).toFixed(2);
};

const healthy = (values = {}) => !Object.keys(values).some((key) => values[key] === INCOMPLETE);

export default (req, res) => {
  const { now } = time();
  const cryptos = skeleton();
  const currencies = skeleton();
  const metals = skeleton();
  const historyCryptos = {};
  const historyCurrencies = {};
  const historyMetals = {};

  let store = new Store({ filename: 'latest' });
  let rows = store.read();
  let count = 0;
  Object.keys(rows)
    .sort()
    .reverse()
    .some((date) => {
      const [year, month, day] = date.split('-');

      Object.keys(rows[date])
        .sort()
        .reverse()
        .some((hour) => {
          const index = (new Date(year, month - 1, day, hour)).toISOString();
          const symbols = Object.keys(rows[date][hour]);

          if (cryptos[index]) cryptos[index] = state(CRYPTOS, symbols);
          if (currencies[index]) currencies[index] = state(CURRENCIES, symbols);
          if (metals[index]) metals[index] = state(METALS, symbols);

          count += 1;
          return count > RESOLUTION;
        });

      return count > RESOLUTION;
    });

  const { year } = time();
  store = new Store({ filename: year });
  rows = store.read();
  count = 0;
  Object.keys(rows)
    .sort()
    .reverse()
    .some((date) => {
      const symbols = Object.keys(rows[date]);

      historyCryptos[date] = state(CRYPTOS, symbols);
      historyCurrencies[date] = state(CURRENCIES, symbols);
      historyMetals[date] = state(METALS, symbols);

      count += 1;
      return count >= RESOLUTION;
    });

  const healthyServices = healthy(currencies) && healthy(metals) && healthy(cryptos);
  res.send(render('base', {
    page: render('status', {
      version: PKG.version,
      now,
      RESOLUTION,
      color: healthyServices ? 'green' : 'yellow',
      state: healthyServices ? 'All services are online' : 'There is some partial degradation',
      cache: renderCache(cache.status.keys),

      cryptos: renderService(cryptos),
      cryptosUptime: uptime(cryptos),
      currencies: renderService(currencies),
      currenciesUptime: uptime(currencies),
      metals: renderService(metals),
      metalsUptime: uptime(metals),

      historyCryptos: renderService(historyCryptos),
      historyCryptosUptime: uptime(historyCryptos),
      historyCurrencies: renderService(historyCurrencies),
      historyCurrenciesUptime: uptime(historyCurrencies),
      historyMetals: renderService(historyMetals),
      historyMetalsUptime: uptime(historyMetals),

      errors: renderErrors(),
    }),
    role: 'status',
  }));
};
