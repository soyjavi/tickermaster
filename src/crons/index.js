import { CronJob } from 'cron';

import currencies from './currencies';
// import metals from './metals';
import cryptos from './cryptos';

const restore = async () => {
  await currencies(false);
  await cryptos(false);
};

const DEFAULTS = { runOnInit: false, start: true, timeZone: 'Europe/London' };
const crons = {};

const start = () => {
  crons.currencies = new CronJob({ cronTime: '0,15,30,45 * * * *', onTick: currencies, ...DEFAULTS });
  crons.cryptos = new CronJob({ cronTime: '1,16,31,46 * * * *', onTick: cryptos, ...DEFAULTS });
  // crons.metals = new CronJob({ cronTime: '0,15,35,45 * * * *', onTick: metals, ...DEFAULTS });
  crons.restore = new CronJob({ cronTime: '0 0 1 * *', onTick: restore, ...DEFAULTS });

  return crons;
};

const stop = () => {
  Object.keys(crons).forEach((cron) => {
    console.log(`[🤖:${cron}] stopped.`);
    crons[cron].stop();
  });
};

export default {
  start,

  stop,
};
