/* eslint complexity: 0 */

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
  LOG_ENABLE,
  LOG_ROOT,
  JSON_PRETTY,
  PUG_ENABLE,
  PUG_PAGES_PATH,
  STATIC_ENABLE,
  STATIC_ROOT,
  CORS_ENABLE,
  CORS_ORIGIN,
  CORS_ALLOW_METHODS,
  SESSION_ENABLE,
  SESSION_KEY,
  ROUTES_ENABLE
} = process.env;

function parseMiddleWaveParams(middlewave) {
  return Array.isArray(middlewave) ? {
    middlewaveName: middlewave[0],
    middlewaveOptions: middlewave[1]
  } : {
    middlewaveName: middlewave,
    middlewaveOptions: null
  };
}

function envErrorMessage(name) {
  return `
    Miss environment variable: ${name}
    Please check \`.env\` file in the project root
  `;
}

function useLogMiddlewave(self, middlewaveOptions) {
  if (!middlewaveOptions && !LOG_ROOT) {
    throw new Error(envErrorMessage('LOG_ROOT'));
  }
  // 创建日志目录
  const logDir = join(cwd, LOG_ROOT);
  mkdirp.sync(logDir);

  // create a rotating write stream
  const accessLogStream = FileStreamRotator.getStream(middlewaveOptions || {
    date_format: 'YYYYMMDD',
    filename: `${logDir}/access__%DATE%.log`,
    frequency: 'daily',
    verbose: false
  });

  self.use(morgan('combined', { stream: accessLogStream }));
}

function useStaticMiddlewave(self, middlewaveOptions) {
  if (!middlewaveOptions && !STATIC_ROOT) {
    throw new Error(envErrorMessage('STATIC_ROOT'));
  }
  const staticFolder = middlewaveOptions || join(cwd, STATIC_ROOT);
  self.use(serve(staticFolder));
}

function useCorsMiddlewave(self, middlewaveOptions) {
  if (!middlewaveOptions) {
    const corsOptions = {
      origin: CORS_ORIGIN,
      allowMethods: CORS_ALLOW_METHODS.split(',')
    };
    // 允许一个或多个指定某域名能访问
    if (CORS_ORIGIN && CORS_ORIGIN !== '*') {
      corsOptions.origin = (ctx) => {
        const headerOrigin = ctx.request.header.origin;
        const isValidate = CORS_ORIGIN.split(',').some(whitelist => new RegExp(whitelist).test(headerOrigin));
        return isValidate ? headerOrigin : false;
      };
    }
    middlewaveOptions = corsOptions;
  }
  self.use(cors(middlewaveOptions));
}

function useSessionMiddlewave(self, middlewaveOptions) {
  self.koa.keys = [SESSION_KEY];
  self.use(session(middlewaveOptions || {}, self.koa));
}

function useBodyMiddlewave(self, middlewaveOptions) {
  self.use(bodyParser(middlewaveOptions));
}

function useJsonMiddlewave(self, middlewaveOptions) {
  self.use(json(middlewaveOptions || { pretty: JSON_PRETTY === 'true' }));
}

function usePugMiddlewave(self, middlewaveOptions) {
  if (!middlewaveOptions && !PUG_PAGES_PATH) {
    throw new Error(envErrorMessage('PUG_PAGES_PATH'));
  }
  const pug = new Pug(middlewaveOptions || { viewPath: join(cwd, PUG_PAGES_PATH) });
  pug.use(self.koa);
}

function useRoutesMiddlewave(self, middlewaveOptions) {
  if (!middlewaveOptions && !DOCUMENT_ROOT) {
    throw new Error(envErrorMessage('DOCUMENT_ROOT'));
  }
  setupRoutes(self.koa, middlewaveOptions || join(cwd, DOCUMENT_ROOT, 'routes'));
}

export default class Qails {
  constructor(options) {
    const { middlewaves } = options || {
      middlewaves: [
        'log',
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

    middlewaves.forEach((mw) => {
      const {
        middlewaveName,
        middlewaveOptions
      } = parseMiddleWaveParams(mw);

      switch (middlewaveName) {
        case 'log':
          if (LOG_ENABLE === 'true') {
            useLogMiddlewave(this, middlewaveOptions);
          }
          break;
        case 'static':
          if (STATIC_ENABLE === 'true') {
            useStaticMiddlewave(this, middlewaveOptions);
          }
          break;
        case 'cors':
          if (CORS_ENABLE === 'true') {
            useCorsMiddlewave(this, middlewaveOptions);
          }
          break;
        case 'session':
          if (SESSION_ENABLE === 'true') {
            useSessionMiddlewave(this, middlewaveOptions);
          }
          break;
        case 'body':
          useBodyMiddlewave(this, middlewaveOptions);
          break;
        case 'json':
          useJsonMiddlewave(this, middlewaveOptions);
          break;
        case 'pug':
          if (PUG_ENABLE === 'true') {
            usePugMiddlewave(this, middlewaveOptions);
          }
          break;
        case 'routes':
          if (ROUTES_ENABLE === 'true') {
            useRoutesMiddlewave(this, middlewaveOptions);
          }
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
