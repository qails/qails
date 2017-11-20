import request from 'supertest';
import should from 'should';
import { buildSchema } from 'graphql';
import { Qails, graphqlMiddleware } from '../../src';

describe('middlewares::graphql', () => {
  const schema = buildSchema(`
    type Query {
      hello: String
    }
  `);

  const root = {
    hello: () => 'Hello world!'
  };

  const app = new Qails([
    graphqlMiddleware({
      schema,
      rootValue: root
    })
  ]);

  it('使用默认endpoint应该返回数据', async () => {
    const { body } = await request(app.listen()).get('/graphql/?query={hello}');
    should(body).be.not.empty();
    body.data.should.have.property('hello', 'Hello world!');
  });

  it('设置Accept:text/html后应该返回html数据', async () => {
    const { header } = await request(app.listen())
      .get('/graphql/?query={hello}')
      .set('Accept', 'text/html');
    header.should.have.property('content-type', 'text/html; charset=utf-8');
  });

  it('不带query参数时应该报错', async () => {
    const { body } = await request(app.listen()).get('/graphql');
    body.should.have.property('errors');
    body.errors[0].should.have.property('message');
    body.errors[0].should.have.property('stack');
  });

  it('自定义endpoint时应该正常返回数据', async () => {
    const endpoint = '/gql';
    const customApp = new Qails([
      graphqlMiddleware({
        endpoint,
        schema,
        rootValue: root
      })
    ]);
    const { body } = await request(customApp.listen()).get(`${endpoint}/?query={hello}`);
    body.data.should.have.property('hello', 'Hello world!');
  });

  it('线上环境不应该返回扩展字段extensions', async () => {
    const originValue = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const customApp = new Qails([
      graphqlMiddleware({
        schema,
        rootValue: root
      })
    ]);
    process.env.NODE_ENV = originValue;
    const { body } = await request(customApp.listen()).get('/graphql/?query={hello}');
    body.data.should.have.property('hello', 'Hello world!');
    body.data.should.not.have.property('extensions');
  });
});
