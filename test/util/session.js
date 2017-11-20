import request from 'supertest';
// import should from 'should';
import { Qails, session } from '../../src';

describe('util::session', () => {
  const app = new Qails();
  session(app);
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
