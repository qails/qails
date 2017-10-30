/* eslint complexity: 0 */

import { join } from 'path';
import Koa from 'koa';
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

const DotenvException = class {
  constructor(name) {
    this.name = 'DotenvException';
    this.message = `Miss environment variable: ${name}. Please check \`.env\` file in the project root`;
  }
};

export default class Qails {
  constructor(options) {
    const { middlewares } = options || {
      middlewares: [
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

    const parseMiddlewareParams = middleware => (Array.isArray(middleware) ? {
      middlewareName: middleware[0],
      middlewareOptions: middleware[1]
    } : {
      middlewareName: middleware,
      middlewareOptions: null
    });

    function useLogMiddleware(self, middlewareOptions) {
      if (!middlewareOptions && !LOG_ROOT) {
        throw new DotenvException('LOG_ROOT');
      }
      // 创建日志目录
      const logDir = join(cwd, LOG_ROOT);
      mkdirp.sync(logDir);

      // create a rotating write stream
      const accessLogStream = FileStreamRotator.getStream(middlewareOptions || {
        date_format: 'YYYYMMDD',
        filename: `${logDir}/access__%DATE%.log`,
        frequency: 'daily',
        verbose: false
      });

      self.use(morgan('combined', { stream: accessLogStream }));
    }

    function useStaticMiddleware(self, middlewareOptions) {
      if (!middlewareOptions && !STATIC_ROOT) {
        throw new DotenvException('STATIC_ROOT');
      }
      const staticFolder = middlewareOptions || join(cwd, STATIC_ROOT);
      self.use(serve(staticFolder));
    }

    function useCorsMiddleware(self, middlewareOptions) {
      if (!middlewareOptions) {
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
        middlewareOptions = corsOptions;
      }
      self.use(cors(middlewareOptions));
    }

    function useSessionMiddleware(self, middlewareOptions) {
      self.koa.keys = [SESSION_KEY];
      self.use(session(middlewareOptions || {}, self.koa));
    }

    function useBodyMiddleware(self, middlewareOptions) {
      self.use(bodyParser(middlewareOptions));
    }

    function useJsonMiddleware(self, middlewareOptions) {
      self.use(json(middlewareOptions || { pretty: JSON_PRETTY === 'true' }));
    }

    function usePugMiddleware(self, middlewareOptions) {
      if (!middlewareOptions && !PUG_PAGES_PATH) {
        throw new DotenvException('PUG_PAGES_PATH');
      }
      const pug = new Pug(middlewareOptions || { viewPath: join(cwd, PUG_PAGES_PATH) });
      pug.use(self.koa);
    }

    function useRoutesMiddleware(self, middlewareOptions) {
      if (!middlewareOptions && !DOCUMENT_ROOT) {
        throw new DotenvException('DOCUMENT_ROOT');
      }
      setupRoutes(self.koa, middlewareOptions || join(cwd, DOCUMENT_ROOT, 'routes'));
    }

    this.koa = qs(new Koa());

    middlewares.forEach((mw) => {
      const {
        middlewareName,
        middlewareOptions
      } = parseMiddlewareParams(mw);

      switch (middlewareName) {
        case 'log':
          if (LOG_ENABLE === 'true') {
            useLogMiddleware(this, middlewareOptions);
          }
          break;
        case 'static':
          if (STATIC_ENABLE === 'true') {
            useStaticMiddleware(this, middlewareOptions);
          }
          break;
        case 'cors':
          if (CORS_ENABLE === 'true') {
            useCorsMiddleware(this, middlewareOptions);
          }
          break;
        case 'session':
          if (SESSION_ENABLE === 'true') {
            useSessionMiddleware(this, middlewareOptions);
          }
          break;
        case 'body':
          useBodyMiddleware(this, middlewareOptions);
          break;
        case 'json':
          useJsonMiddleware(this, middlewareOptions);
          break;
        case 'pug':
          if (PUG_ENABLE === 'true') {
            usePugMiddleware(this, middlewareOptions);
          }
          break;
        case 'routes':
          if (ROUTES_ENABLE === 'true') {
            useRoutesMiddleware(this, middlewareOptions);
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
