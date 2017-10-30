import { existsSync, unlinkSync, statSync, writeFileSync, mkdirSync, rmdirSync } from 'fs';
import { resolve, basename } from 'path';
import request from 'supertest';
import Router from 'koa-router';
import should from 'should';
import { format } from 'date-fns';
import Qails from '../src/qails';

const { LOG_ROOT } = process.env;

const router = new Router();
router.get('/', async (ctx) => {
  ctx.body = 'hello';
});
router.get('/json', async (ctx) => {
  ctx.body = { hello: 'world' };
});

const timestamp = format(Date.now(), 'YYYYMMDD');
const log = resolve(process.cwd(), LOG_ROOT, `access__${timestamp}.log`);

describe('禁用所有中间件时', () => {
  if (existsSync(log)) {
    unlinkSync(log);
  }
  const app = new Qails({ middlewares: [] });
  app.use(router.routes());
  const logFileExists = existsSync(log);

  it('不应该在指定位置生成日志文件', () => {
    should(logFileExists).be.false();
  });

  it('应该返回字符串', (done) => {
    request(app.listen())
      .get('/')
      .expect('Content-Type', /text\/plain/)
      .expect('Content-Length', '5')
      .expect(200)
      .expect('hello', done);
  });

  it('响应头中不包含access-control-allow-origin', (done) => {
    request(app.listen())
      .get('/')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        res.headers.should.have.not.property('access-control-allow-origin');
        return done();
      });
  });

  it('应该返回JSON', (done) => {
    request(app.listen())
      .get('/json')
      .expect('Content-Type', /json/)
      .expect('Content-Length', '17')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        res.body.should.have.property('hello', 'world');
        return done();
      });
  });
});

describe('中间件：log', () => {
  describe('禁用', () => {
    it('不应该在指定位置生成日志文件', () => {
      if (existsSync(log)) {
        unlinkSync(log);
      }
      const app = new Qails({ middlewares: [] });
      app.use(router.routes());
      const logFileExists = existsSync(log);
      should(logFileExists).be.false();
    });

    it('不应该在指定位置生成日志文件', () => {
      if (existsSync(log)) {
        unlinkSync(log);
      }
      const originValue = process.env.LOG_ENABLE;
      process.env.LOG_ENABLE = 'false';
      const app = new Qails({ middlewares: ['log'] });
      app.use(router.routes());
      const logFileExists = existsSync(log);
      should(logFileExists).be.false();
      process.env.LOG_ENABLE = originValue;
    });
  });

  describe('启用', () => {
    if (existsSync(log)) {
      unlinkSync(log);
    }
    it('不设置LOG_ROOT时应该抛出异常', () => {
      const originValue = process.env.LOG_ROOT;
      process.env.LOG_ROOT = '';
      try {
        // eslint-disable-next-line
        new Qails({ middlewares: ['log'] });
        should.fail();
      } catch (e) {
        e.should.have.property('name', 'DotenvException');
      }
      process.env.LOG_ROOT = originValue;
    });

    it('应该在指定位置生成日志文件', (done) => {
      const app = new Qails({ middlewares: ['log'] });
      app.use(router.routes());
      request(app.listen())
        .get('/')
        .expect(200)
        .end((err) => {
          if (err) {
            return done(err);
          }
          existsSync(log).should.be.true();
          const { size } = statSync(log);
          size.should.not.eql(0);
          return done();
        });
    });
  });
});

describe('启动static中间件', () => {
  it('不设置STATIC_ROOT时应该抛出异常', () => {
    const app = new Qails({ middlewares: ['static'] });
    app.use(router.routes());

    const originValue = process.env.STATIC_ROOT;
    process.env.STATIC_ROOT = '';
    try {
      // eslint-disable-next-line
      new Qails({ middlewares: ['static'] });
      should.fail();
    } catch (e) {
      e.should.have.property('name', 'DotenvException');
    }
    process.env.STATIC_ROOT = originValue;
  });

  it('STATIC_ENABLE=false时应该返回404', (done) => {
    const originValue = process.env.STATIC_ENABLE;
    process.env.STATIC_ENABLE = 'false';
    const app = new Qails({ middlewares: [['static', __dirname]] });
    app.use(router.routes());
    request(app.listen())
      .get(`/${basename(__filename)}`)
      .expect(404, done);
    process.env.STATIC_ENABLE = originValue;
  });

  const app = new Qails({ middlewares: [['static', __dirname]] });
  app.use(router.routes());

  it('应该能获取到存在的静态文件', (done) => {
    request(app.listen())
      .get(`/${basename(__filename)}`)
      .expect(200, done);
  });

  it('不存在的文件应该返回404', (done) => {
    request(app.listen())
      .get('/404.js')
      .expect(404, done);
  });
});

describe('启动cors中间件', () => {
  it('响应头中应该不包含access-control-allow-origin', (done) => {
    const originValue = process.env.CORS_ENABLE;
    process.env.CORS_ENABLE = 'false';
    const app = new Qails({ middlewares: ['cors'] });
    app.use(router.routes());
    request(app.listen())
      .get('/')
      .expect(200)
      .end((err, res) => {
        res.header.should.not.have.property('access-control-allow-origin');
        return done();
      });
    process.env.CORS_ENABLE = originValue;
  });
  it('响应头中应该包含access-control-allow-origin', (done) => {
    const app = new Qails({ middlewares: ['cors'] });
    app.use(router.routes());
    request(app.listen())
      .get('/')
      .expect('access-control-allow-origin', '*')
      .expect(200, done);
  });
  it('对某一个域名开放CORS', (done) => {
    const originValue = process.env.CORS_ORIGIN;
    const origin = 'http://www.qunar.com';
    process.env.CORS_ORIGIN = origin;
    const app = new Qails({ middlewares: ['cors'] });
    process.env.CORS_ORIGIN = originValue;
    app.use(router.routes());
    request(app.listen())
      .get('/')
      .set('origin', origin)
      .expect('access-control-allow-origin', origin)
      .expect(200, done);
  });
});

describe('启动session中间件', () => {
  describe('SESSION_ENABLE=true', () => {
    const app = new Qails({ middlewares: ['session'] });
    app.use(async (ctx) => {
      ctx.session.views = (ctx.session.views || 0) + 1;
      ctx.body = ctx.session.views;
    });

    it('第一次请求应该返回1', (done) => {
      request(app.listen())
        .get('/')
        .expect(200)
        .expect('set-cookie', /koa:sess/)
        .expect('1', done);
    });

    it('第二次请求应该返回2', (done) => {
      const server = app.listen();
      request(server)
        .post('/')
        .expect('set-cookie', /koa:sess/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const cookie = res.headers['set-cookie'].join(';');
          return request(server)
            .get('/')
            .set('cookie', cookie)
            .expect('2', done);
        });
    });
  });

  describe('SESSION_ENABLE=false', () => {
    const originValue = process.env.SESSION_ENABLE;
    process.env.SESSION_ENABLE = '';
    const app = new Qails({ middlewares: ['session'] });
    process.env.SESSION_ENABLE = originValue;
    app.use(async (ctx) => { ctx.session = null; });

    it('响应头中不应该包含set-cookie', (done) => {
      request(app.listen())
        .get('/')
        .expect(200)
        .end((err, res) => {
          res.header.should.not.have.property('set-cookie');
          return done();
        });
    });
  });
});

describe('启动body中间件', () => {
  const app = new Qails({ middlewares: ['body'] });
  app.use(router.routes());

  it('应该能获取到存在的静态文件', (done) => {
    request(app.listen())
      .get('/')
      .expect(200, done);
  });
});

describe('启动json中间件', () => {
  const app = new Qails({ middlewares: ['json'] });
  app.use(async (ctx) => {
    ctx.body = { foo: 'bar' };
  });

  it('应该返回格式化后的JSON', (done) => {
    request(app.listen())
      .get('/')
      .expect('{\n  "foo": "bar"\n}', done);
  });
});

describe('启动pug中间件', () => {
  const filename = 'test.pug';
  const templateRoot = resolve('test/.tmp');
  const template = resolve(templateRoot, filename);
  writeFileSync(template, `| ${filename}`);

  it('不设置PUG_PAGES_PATH时应该抛出异常', () => {
    const app = new Qails({ middlewares: [['pug']] });
    app.use(router.routes());

    const originValue = process.env.PUG_PAGES_PATH;
    process.env.PUG_PAGES_PATH = '';
    try {
      // eslint-disable-next-line
      new Qails({ middlewares: ['pug'] });
      should.fail();
    } catch (e) {
      e.should.have.property('name', 'DotenvException');
    }
    process.env.PUG_PAGES_PATH = originValue;
  });

  it('PUG_ENABLE=false时应该返回500', (done) => {
    const originValue = process.env.STATIC_ENABLE;
    process.env.PUG_ENABLE = 'false';
    const app = new Qails({ middlewares: [['pug', { viewPath: templateRoot }]] });
    app.use(async (ctx) => {
      ctx.render(filename);
    });
    try {
      request(app.listen())
        .get('/')
        .expect(500, done);
    } catch (e) {
      console.log('===');
    }
    process.env.PUG_ENABLE = originValue;
  });

  const app = new Qails({ middlewares: [['pug', { viewPath: templateRoot }]] });
  app.use(async (ctx) => {
    ctx.render(filename);
  });

  it('应该返回解析后的HTML', (done) => {
    request(app.listen())
      .get('/')
      .expect(filename, () => {
        unlinkSync(template);
        return done();
      });
  });
});

describe('启动routes中间件', () => {
  const filename = 'index.js';
  const routesRoot = resolve('test/.tmp', 'routes');
  const routesSub = resolve(routesRoot, 'sub');
  const getText = endpoint => `
    import Router from 'koa-router';
    const router = new Router();
    router.get('${endpoint}', async (ctx) => {
      ctx.body = '${endpoint}';
    });
    export default router;
  `;

  if (!existsSync(routesRoot)) {
    mkdirSync(routesRoot);
  }

  const root = '/';
  const sub = '/sub';

  const homeRouter = resolve(routesRoot, filename);
  writeFileSync(homeRouter, getText(root));

  if (!existsSync(routesSub)) {
    mkdirSync(routesSub);
  }
  const subRouter = resolve(routesSub, filename);
  writeFileSync(subRouter, getText(sub));

  it('不设置router默认地址时应该抛出异常', () => {
    const originValue = process.env.DOCUMENT_ROOT;
    process.env.DOCUMENT_ROOT = '';
    try {
      // eslint-disable-next-line
      new Qails({ middlewares: ['routes'] });
      should.fail();
    } catch (e) {
      e.should.have.property('name', 'DotenvException');
    }
    process.env.DOCUMENT_ROOT = originValue;
  });

  it('ROUTES_ENABLE=false时应该抛出异常', (done) => {
    const originValue = process.env.ROUTES_ENABLE;
    process.env.ROUTES_ENABLE = 'false';
    const app = new Qails({ middlewares: [['routes', routesRoot]] });
    request(app.listen())
      .get(root)
      .expect(404, done);
    process.env.ROUTES_ENABLE = originValue;
  });

  const app = new Qails({ middlewares: [['routes', routesRoot]] });
  it('一级目录路由解析应该正常', (done) => {
    request(app.listen())
      .get(root)
      .end((err, res) => {
        res.should.have.property('text', root);
        return done();
      });
  });

  it('多级目录路由解析应该正常', (done) => {
    request(app.listen())
      .get(sub)
      .end((err, res) => {
        res.should.have.property('text', sub);
        unlinkSync(subRouter);
        unlinkSync(homeRouter);
        rmdirSync(routesSub);
        rmdirSync(routesRoot);
        return done();
      });
  });
});

describe('启动自定义中间件', () => {
  const body = 'body';
  const custom = async (ctx) => {
    ctx.body = body;
  };
  const app = new Qails({ middlewares: [custom] });

  it('应该返回custom', (done) => {
    request(app.listen())
      .get('/')
      .expect(body, done);
  });
});
