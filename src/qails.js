import { join } from 'path';
import Koa from 'koa';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import qs from 'koa-qs';
import morgan from 'koa-morgan';
import serve from 'koa-static';
import FileStreamRotator from 'file-stream-rotator';
import mkdirp from 'mkdirp';
import setupRoutes from './util/setup-routes';

const cwd = process.cwd();
const { JSON_PRETTY } = process.env;

// 创建日志目录
const logDir = join(cwd, 'logs');
mkdirp.sync(logDir);

// create a rotating write stream
const accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: `${logDir}/access__%DATE%.log`,
  frequency: 'daily',
  verbose: false
});

export default class Qails {
  constructor(options) {
    this.koa = qs(new Koa());
    this.use(morgan('combined', { stream: accessLogStream }));
    this.use(serve(options.staticPath || join(cwd, 'static')));
    this.use(bodyParser());
    this.use(json({ pretty: JSON_PRETTY === 'true' }));
    if (options.routePath) {
      setupRoutes(this.koa, options.routePath);
    }
    this.server = null;
  }

  use(...args) {
    this.koa.use(...args);
    return this;
  }

  listen(port, cb) {
    this.server = this.koa.listen(port, cb);
    return this.server;
  }
}
