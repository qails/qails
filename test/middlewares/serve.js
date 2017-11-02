import { basename } from 'path';
import request from 'supertest';
import should from 'should';
import { Qails } from '../../src';
import serve from '../../src/middlewares/serve';

describe('middlewares::serve', () => {
  it('程序应该正常运行', () => {
    const app = new Qails(serve());
    should(app).not.throw();
  });

  const app = new Qails(serve(__dirname));
  it('应该返回静态文件内容', (done) => {
    request(app.listen())
      .get(`/${basename(__filename)}`)
      .expect(200, done);
  });

  it('不应该返回不存在的静态文件内容', (done) => {
    request(app.listen())
      .get('/404.js')
      .expect(404, done);
  });
});
