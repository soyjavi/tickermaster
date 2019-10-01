export default () => {
  const now = new Date();

  return {
    now,
    date: now.toISOString().substr(0, 10),
    hour: now.toISOString().substr(11, 2),
  };
};
