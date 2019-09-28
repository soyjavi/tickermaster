import { CronJob } from 'cron';

import metals from './metals';
import cryptos from './cryptos';

const DEFAULTS = { runOnInit: true, start: true, timeZone: 'Europe/London' };
const crons = {};

const start = () => {
  crons.metals = new CronJob({ cronTime: '0 * * * *', onTick: metals, ...DEFAULTS });
  crons.cryptos = new CronJob({ cronTime: '30 * * * *', onTick: cryptos, ...DEFAULTS });

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
