import request from 'supertest';
import { Qails } from '../../src';

describe('middlewares::checkurl', () => {
  it('/checkurl应该返回200', (done) => {
    const app = new Qails();
    request(app.listen())
      .get('/checkurl')
      .expect(200)
      .expect('ok', done);
  });
});
