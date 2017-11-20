import request from 'supertest';
import should from 'should';
import { Qails, envelopeMiddleware } from '../../src';

describe('middlewares::envelope', () => {
  const hello = 'hello';
  const stateCode = 0;
  const stateMessage = 'message';
  const first = async (ctx, next) => {
    ctx.state.code = stateCode;
    ctx.state.message = stateMessage;
    await next();
  };
  const second = async (ctx, next) => {
    ctx.body = hello;
    await next();
  };

  it('输出内容应该不包含data节点', async () => {
    const app = new Qails(envelopeMiddleware);
    app.use(first);
    const { body } = await request(app.listen()).get('/');
    body.should.have.property('code', stateCode);
    body.should.have.property('message', stateMessage);
    body.should.not.have.property('data');
  });

  it('应该原样输出ctx.body内容', (done) => {
    const app = new Qails();
    app.use(second);
    request(app.listen())
      .get('/')
      .expect(hello, done);
  });

  it('应该原样输出ctx.body内容', (done) => {
    const app = new Qails(envelopeMiddleware);
    app.use(second);
    request(app.listen())
      .get('/')
      .expect(hello, done);
  });

  it('应该输出带信封的ctx.body内容', (done) => {
    const app = new Qails(envelopeMiddleware);
    app.use(first);
    app.use(second);
    request(app.listen())
      .get('/')
      .end((err, res) => {
        const { body: { code, message, data } } = res;
        should(code).eql(stateCode);
        should(message).eql(stateMessage);
        should(data).eql(hello);
        return done();
      });
  });
});
