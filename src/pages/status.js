import PKG from '../../package.json';

import {
  C, cache, render, Store, time,
} from '../common';

import arrayToHtml from './modules/arrayToHtml';

const { URL: { SERVICE } } = C;

export default (req, res) => {
  const { now, date } = time();
  const errors = new Store({ filename: 'errors' });
  const store = new Store({ filename: date.substr(0, 7) });
  const rates = store.read() || {};
  const hours = {};


  const { status } = cache;
  const cacheMarkup = Object.keys(status.keys)
    .filter((key) => key.substr(0, 5) !== 'page:')
    .map((key) => render('templates/item-cache', { SERVICE, key, seconds: status.keys[key] }));

  Object.keys(rates[date] || {})
    .sort()
    .forEach((hour) => {
      hours[hour] = Object.keys(rates[date][hour]).length;
    });

  res.send(render('base', {
    page: render('status', {
      version: PKG.version,
      now,
      color: 'green',
      cacheMarkup: cacheMarkup.length > 0
        ? arrayToHtml(cacheMarkup)
        : '<span class="color-lighten">No data</span>',
      json: JSON.stringify({
        latest: {
          date,
          ...hours,
        },
        errors: errors.read(),
      }),
    }),
    role: 'status',
  }));
};
