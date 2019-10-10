import { C, render } from '../common';

const { PKG: { name } } = C;

export default (req, res) => {
  const { params: { base, symbol } } = req;

  res.send(render('base', {
    page: render('chart'),
    role: 'chart',
    title: `${name} - ${base}${symbol}`,
  }));
};
