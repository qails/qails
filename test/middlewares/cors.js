import request from 'supertest';
import should from 'should';
import { Qails } from '../../src';
import cors from '../../src/middlewares/cors';

describe('middlewares::cors', () => {
  it('响应头中应该不包含access-control-allow-origin', (done) => {
    const app = new Qails();
    request(app.listen())
      .get('/')
      .end((err, res) => {
        should(res.header).not.have.property('access-control-allow-origin');
        return done();
      });
  });

  it('响应头中应该包含access-control-allow-origin', (done) => {
    const app = new Qails(cors());
    request(app.listen())
      .get('/')
      .expect('access-control-allow-origin', '*')
      .expect(404, done);
  });
});
