import { resolve } from 'path';
import morgan from 'koa-morgan';
import FileStreamRotator from 'file-stream-rotator';
import mkdirp from 'mkdirp';

export default (fileStream, morganFormat, morganOptions) => {
  const { root, filename, dateFormat, frequency, verbose } = {
    ...{
      root: resolve(process.cwd(), 'logs'),
      filename: 'access__%DATE%.log',
      // http://momentjs.com/docs/#/displaying/format/
      dateFormat: 'YYYYMMDD',
      frequency: 'daily',
      verbose: false
    },
    ...fileStream
  };

  mkdirp.sync(root);

  // create a rotating write stream
  const accessLogStream = FileStreamRotator.getStream({
    date_format: dateFormat,
    filename: resolve(root, filename),
    frequency,
    verbose
  });

  const format = morganFormat || 'combined';
  const options = { ...morganOptions, stream: accessLogStream };

  return morgan(format, options);
};
