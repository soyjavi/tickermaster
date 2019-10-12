import { Store, time } from '../../common';

export default (symbols = {}) => {
  const { date, hour } = time();
  const store = new Store({ filename: 'latest' });
  let rows = store.read();

  rows = {
    ...rows,
    [date]: {
      ...rows[date],
      [hour]: { ...(rows[date] ? rows[date][hour] : {}), ...symbols },
    },
  };

  // @TODO: Keep only last 7 days

  store.write(rows);
};
