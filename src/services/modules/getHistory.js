import { time, Store } from '../../modules';

export default (previousMonths = 1) => {
  const { date } = time();
  const [year, month] = date.split('-');
  let filename = date.substr(0, 7);
  let store = new Store({ filename });
  let history = store.read();

  for (let i = 0; i < previousMonths; i += 1) {
    filename = (new Date(year, month - (i + 1))).toISOString().substr(0, 7);
    store = new Store({ filename });
    history = { ...history, ...store.read() };
  }

  return history;
};
