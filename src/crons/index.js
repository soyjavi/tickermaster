import { CronJob } from 'cron';

import metals from './metals';

const DEFAULTS = { runOnInit: true, start: true, timeZone: 'Europe/London' };
const crons = {};

const start = async () => {

  // -- CriptoPanic.com
  crons.metals = new CronJob({ cronTime: '*/30 * * * *', onTick: metals, ...DEFAULTS });

  return crons;
};

const stop = () => {
  Object.keys(crons).forEach((cron) => {
    console.log(`[🤖:${cron}]`);
    crons[cron].stop();
  });
};

export default {
  start,

  stop,
};
