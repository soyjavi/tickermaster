import dotenv from 'dotenv';
import Xray from 'x-ray';

import { cache, ERROR, time } from '../common';
import { storeLatest } from './modules';

const x = Xray({
  filters: {
    cleanup(value) {
      return value && value.replace(/[^0-9.]/gm, '');
    },
  },
});

dotenv.config();
const METALS_URL = 'https://www.moneymetals.com/';
const METALS_SCHEMA = {
  XAU: '#sp-price-gold | cleanup',
  XAG: '#sp-icon-silver | cleanup',
  XPD: '#sp-price-platinum | cleanup',
  XPT: '#sp-price-palladium | cleanup',
};

const HEADER = '[🤖:metals]';

export default async () => {
  const { date, hour } = time();

  console.log(`${HEADER} ${date}-${hour} searching new rates ...`);
  cache.wipe();

  try {
    console.log(`🔎 ${HEADER} fetching ${METALS_URL}`);

    x(METALS_URL, METALS_SCHEMA)((error, metals) => {
      if (error) throw Error(error);
      if (!Object.keys(metals).length > 0) throw Error('Rates not found.');

      storeLatest(metals);

      console.log(`${HEADER} found ${Object.keys(metals).length} new rates...`);
    });

  } catch ({ message }) { ERROR.store(`${HEADER} ${message}`); }
};
