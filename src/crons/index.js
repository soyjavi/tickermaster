import { CronJob } from 'cron';

import currencies from './currencies';
import metals from './metals';
import cryptos from './cryptos';

const worker = async (props) => {
  await currencies(props);
  await metals(props);
  await cryptos(props);
};

const DEFAULTS = { runOnInit: false, start: true, timeZone: 'Europe/London' };
const crons = {};

const start = () => {
  crons.latest = new CronJob({ cronTime: '0,29,59 * * * *', onTick: () => worker({ latest: true }), ...DEFAULTS });
  crons.restore = new CronJob({ cronTime: '30 0 1 * *', onTick: worker, ...DEFAULTS });

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
