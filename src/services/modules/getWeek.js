export default (value) => {
  const date = new Date(value);
  const start = new Date(date.getFullYear(), 0, 1);

  return Math.ceil((((date - start) / 86400000) + start.getDay() + 1) / 7);
};
