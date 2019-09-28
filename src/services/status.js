import PKG from '../../package.json';

export default (req, res) => {
  res.json({
    version: PKG.version,
  })
};
