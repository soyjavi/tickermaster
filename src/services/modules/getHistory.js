import { C, Store, time } from '../../common';

const { TIMELINE: { HOURLY, DAILY, WEEKLY } } = C;

export default (group) => {
  const { date } = time();
  const [year] = date.split('-');

  let store = new Store({ filename: group === HOURLY ? 'latest' : year });
  let rows = store.read();

  if (group !== HOURLY) {
    const repeat = (group === DAILY || group === WEEKLY) ? 2 : 10;

    for (let i = 0; i < repeat; i += 1) {
      store = new Store({ filename: year - i });
      rows = { ...rows, ...store.read() };
    }
  }

  return rows;
};
