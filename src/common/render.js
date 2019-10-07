import fs from 'fs';
import path from 'path';

import cache from './cache';
import C from './constants';

const {
  PKG: { name: title, description, version }, URL: { SERVICE: url },
} = C;
const FOLDER = path.resolve('.', 'src/pages');
const BINDING_REGEXP = new RegExp(/{{.*}}/, 'g');
const DEFAULTS = {
  title, description, version, url,
};

export default (filename = 'index', values = {}, forceCache = true) => {
  const cacheKey = `page:${filename}`;
  let page = forceCache ? cache.get(cacheKey) : undefined;

  if (!page) {
    const uriFile = `${FOLDER}/${filename}.html`;

    if (!fs.existsSync(uriFile)) throw new Error(`${filename} could not read correctly.`);
    page = fs.readFileSync(uriFile, 'utf8');
    cache.set(cacheKey, page);
  }

  const dataSource = { ...DEFAULTS, ...values };
  Object.keys(dataSource).forEach((key) => {
    page = page.replace(new RegExp(`{{${key}}}`, 'g'), dataSource[key]);
  });

  page = page.replace(BINDING_REGEXP, '');

  return page;
};
