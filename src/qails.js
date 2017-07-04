import { join } from 'path';
import Koa from 'koa';
// import convert from 'koa-convert';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import qs from 'koa-qs';
import morgan from 'koa-morgan';
import serve from 'koa-static';
import cors from 'koa2-cors';
import Pug from 'koa-pug';
import session from 'koa-session';
import FileStreamRotator from 'file-stream-rotator';
import mkdirp from 'mkdirp';
import setupRoutes from './util/setup-routes';

const cwd = process.cwd();
const {
  DOCUMENT_ROOT,
  LOG_ROOT,
  JSON_PRETTY,
  PUG_PAGES_PATH,
  STATIC_ROOT,
  CORS_ORIGIN,
  CORS_ALLOW_METHODS
 } = process.env;

// 创建日志目录
const logDir = join(cwd, LOG_ROOT);
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
    const { middlewaves } = options || {
      middlewaves: [
        'static',
        'cors',
        'session',
        'body',
        'json',
        'pug',
        'routes'
      ]
    };
    const corsOptions = {
      origin: CORS_ORIGIN,
      allowMethods: CORS_ALLOW_METHODS.split(',')
    };

    this.koa = qs(new Koa());
    this.use(morgan('combined', { stream: accessLogStream }));
    middlewaves.forEach((mw) => {
      switch (mw) {
        case 'static':
          this.use(serve(join(cwd, STATIC_ROOT || 'static')));
          break;
        case 'cors':
          // 允许一个或多个指定某域名能访问
          if (CORS_ORIGIN && CORS_ORIGIN !== '*') {
            corsOptions.origin = (ctx) => {
              const headerOrigin = ctx.request.header.origin;
              const isValidate = CORS_ORIGIN.split(',').some(whitelist => new RegExp(whitelist).test(headerOrigin));
              return isValidate ? headerOrigin : false;
            };
          }
          this.use(cors(corsOptions));
          break;
        case 'session':
          this.use(session({}, this.koa));
          break;
        case 'body':
          this.use(bodyParser());
          break;
        case 'json':
          this.use(json({ pretty: JSON_PRETTY === 'true' }));
          break;
        case 'pug':
          (new Pug({ viewPath: join(cwd, PUG_PAGES_PATH) })).use(this.koa);
          break;
        case 'routes':
          setupRoutes(this.koa, join(cwd, DOCUMENT_ROOT, 'routes'));
          break;
        default:
          this.use(mw);
      }
    });

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
