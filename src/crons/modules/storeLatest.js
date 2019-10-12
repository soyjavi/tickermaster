import { Store, time } from '../../common';

export default (symbols = {}) => {
  const { date, hour } = time();
  const store = new Store({ filename: 'latest' });
  const rows = store.read();

  store.write({
    ...rows,
    [date]: {
      ...rows[date],
      [hour]: { ...(rows[date] ? rows[date][hour] : {}), ...symbols },
    },
  });
};
