/**
 * 记录网站访问日志的中间件
 * 可以通过修改配置来实现以下自定义
 *   - 日志格式
 *   - 日志文件保存路径
 *   - 日志文件分割策略
 *
 * @param fileStream {object} file-stream-rotator选项
 * @param morganFormat {object} 日志格式
 * @param morganOptions {object} morgan选项
 *
 * @see
 * https://github.com/koa-modules/morgan
 * https://github.com/rogerc/file-stream-rotator
 */

import { resolve } from 'path';
import morgan from 'koa-morgan';
import FileStreamRotator from 'file-stream-rotator';
import mkdirp from 'mkdirp';

export default (fileStream, morganFormat, morganOptions) => {
  const { root, filename, dateFormat, frequency, verbose } = {
    ...{
      root: resolve('logs'),
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
