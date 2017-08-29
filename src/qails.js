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

function parseMiddleWaveParams(middlewave) {
  return Array.isArray(middlewave) ? {
    middlewaveName: middlewave[0],
    middlewaveOptions: middlewave[1]
  } : {
    middlewaveName: middlewave,
    middlewaveOptions: null
  };
}

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
  date_format: 'YYYY-MM-DD',
  filename: `${logDir}/access_%DATE%.log`,
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

    this.koa = qs(new Koa());
    this.use(morgan('combined', { stream: accessLogStream }));
    // eslint-disable-next-line
    middlewaves.forEach((mw) => {
      let {
        // eslint-disable-next-line
        middlewaveName,
        middlewaveOptions
      } = parseMiddleWaveParams(mw);

      switch (middlewaveName) {
        case 'static':
          middlewaveOptions = middlewaveOptions || join(cwd, STATIC_ROOT || 'static');
          this.use(serve(middlewaveOptions));
          break;
        case 'cors':
          if (!middlewaveOptions) {
            // 允许一个或多个指定某域名能访问
            const corsOptions = {
              origin: CORS_ORIGIN,
              allowMethods: CORS_ALLOW_METHODS.split(',')
            };
            if (CORS_ORIGIN && CORS_ORIGIN !== '*') {
              corsOptions.origin = (ctx) => {
                const headerOrigin = ctx.request.header.origin;
                const isValidate = CORS_ORIGIN.split(',').some(whitelist => new RegExp(whitelist).test(headerOrigin));
                return isValidate ? headerOrigin : false;
              };
            }
            middlewaveOptions = corsOptions;
          }
          this.use(cors(middlewaveOptions));
          break;
        case 'session':
          middlewaveOptions = middlewaveOptions || {};
          this.use(session(middlewaveOptions, this.koa));
          break;
        case 'body':
          this.use(bodyParser(middlewaveOptions));
          break;
        case 'json':
          middlewaveOptions = middlewaveOptions || { pretty: JSON_PRETTY === 'true' };
          this.use(json(middlewaveOptions));
          break;
        case 'pug':
          middlewaveOptions = middlewaveOptions || { viewPath: join(cwd, PUG_PAGES_PATH) };
          (new Pug(middlewaveOptions)).use(this.koa);
          break;
        case 'routes':
          middlewaveOptions = middlewaveOptions || join(cwd, DOCUMENT_ROOT, 'routes');
          setupRoutes(this.koa, middlewaveOptions);
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
