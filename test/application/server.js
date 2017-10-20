import { existsSync, unlinkSync, statSync, writeFileSync, mkdirSync, rmdirSync } from 'fs';
import { resolve, basename } from 'path';
import request from 'supertest';
import Router from 'koa-router';
import should from 'should';
import { format } from 'date-fns';
import Qails from '../../src/qails';

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

describe('启动log中间件', () => {
  if (existsSync(log)) {
    unlinkSync(log);
  }
  const app = new Qails({ middlewares: ['log'] });
  app.use(router.routes());

  it('应该在指定位置生成日志文件', (done) => {
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

describe('启动static中间件', () => {
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
  const app = new Qails({ middlewares: ['cors'] });
  app.use(router.routes());

  it('响应头中应该包含access-control-allow-origin', (done) => {
    request(app.listen())
      .get('/')
      .expect('access-control-allow-origin', '*')
      .expect(200, done);
  });
});

describe('启动session中间件', () => {
  const app = new Qails({ middlewares: ['session'] });
  app.use(async (ctx) => {
    ctx.session.views = (ctx.session.views || 0) + 1;
    ctx.body = ctx.session.views;
  });

  it('第一次请求应该返回1', (done) => {
    request(app.listen())
      .get('/')
      .expect(200)
      .expect('Set-Cookie', /koa:sess/)
      .expect('1', done);
  });

  it('第二次请求应该返回2', (done) => {
    const server = app.listen();
    request(server)
      .post('/')
      .expect('Set-Cookie', /koa:sess/)
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

describe('启动body中间件', () => {
  // const app = new Qails({ middlewares: ['body'] });
  // app.use(router.routes());
  //
  // it('应该能获取到存在的静态文件', (done) => {
  //   request(app.listen())
  //     .get('/init.js')
  //     .expect(200, done);
  // });
  //
  // it('不存在的文件应该返回404', (done) => {
  //   request(app.listen())
  //     .get('/404.js')
  //     .expect(404, done);
  // });
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
  const template = resolve(__dirname, filename);
  writeFileSync(template, `| ${filename}`);

  const app = new Qails({ middlewares: [['pug', { viewPath: __dirname }]] });
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
  const hello = 'hello';
  const filename = 'index.js';
  const routesRoot = resolve(__dirname, 'routes');
  if (!existsSync(routesRoot)) {
    mkdirSync(routesRoot);
  }
  const homeRouter = resolve(routesRoot, filename);
  writeFileSync(homeRouter, `
    import Router from 'koa-router';
    const router = new Router();
    router.get('/', async (ctx) => {
      ctx.body = '${hello}';
    });
    export default router;
  `);

  const app = new Qails({ middlewares: [['routes', routesRoot]] });

  it('路由解析应该正常', (done) => {
    request(app.listen())
      .get('/')
      .expect(hello, () => {
        unlinkSync(homeRouter);
        rmdirSync(routesRoot);
        return done();
      });
  });
});
