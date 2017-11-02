import request from 'supertest';
// import should from 'should';
import { Qails } from '../../src';
import prettyJson from '../../src/middlewares/prettyJson';

describe('middlewares::prettyJson', () => {
  it('应该返回JSON数据原始格式', (done) => {
    const app = new Qails();
    app.use(async (ctx) => { ctx.body = { foo: 'bar' }; });
    request(app.listen())
      .get('/')
      .expect('Content-Length', '13')
      .expect('{"foo":"bar"}', done);
  });

  it('应该返回美化后的JSON数据', (done) => {
    const app = new Qails(prettyJson());
    app.use(async (ctx) => { ctx.body = { foo: 'bar' }; });
    request(app.listen())
      .get('/')
      .expect('Content-Length', '18')
      .expect('{\n  "foo": "bar"\n}', done);
  });
});
