export default () => {
  const now = new Date();

  return {
    now,
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
    date: now.toISOString().substr(0, 10),
    hour: now.toISOString().substr(11, 2),
  };
};
