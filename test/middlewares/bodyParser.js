import request from 'supertest';
import should from 'should';
import { Qails, bodyParserMiddleware } from '../../src';

describe('middlewares::bodyParser', () => {
  it('request.body应该取不到任何数据', (done) => {
    const app = new Qails();
    app.use(async (ctx) => { ctx.body = ctx.request.body; });
    request(app.listen())
      .put('/')
      .send({ id: 1 })
      .end((err, res) => {
        should(res.text).be.empty();
        return done();
      });
  });

  it('request.body应该取到PUT数据', (done) => {
    const id = 1;
    const app = new Qails(bodyParserMiddleware());
    app.use(async (ctx) => { ctx.body = ctx.request.body; });
    request(app.listen())
      .put('/')
      .send({ id })
      .end((err, res) => {
        res.text.should.not.be.empty();
        res.body.should.have.property('id', id);
        return done();
      });
  });
});
