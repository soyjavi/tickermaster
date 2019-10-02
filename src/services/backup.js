import archiver from 'archiver';
import dotenv from 'dotenv';

import PKG from '../../package.json';
import { ERROR } from '../common';

dotenv.config();
const { SECRET } = process.env;

export default (req, res) => {
  const { params: { key } } = req;

  if (key !== SECRET) return ERROR.NOT_FOUND(res);
  const filename = (new Date()).toISOString();
  const zip = archiver('zip', { zlib: { level: 9 } });

  res.setHeader('Content-Disposition', 'attachment');
  res.attachment(`${PKG.name}-v${PKG.version}-${filename}.zip`);

  zip.pipe(res);
  zip.directory('store/', false).finalize();

  return res;
};
