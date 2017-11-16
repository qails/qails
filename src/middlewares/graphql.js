/**
 * 为 koa 自动增加 GraphQL 的中间件
 * 该中间件注册后，会自动增加一个 /:endpoint 的路由
 *
 * @param {GraphQLSchema} schema - schema
 * @param {object} [rootValue] - graphql resolve
 * @param {string} [endpoint=/graphql] - 服务根路径
 * @param {boolean} [graphiql] - 是否使用 graphiql 工具
 * @param {string} [context]
 * @param {boolean} [pretty]
 * @param {function} [formatError]
 *
 * @see
 * https://github.com/chentsulin/koa-graphql
 */

import Router from 'koa-router';
import graphqlHTTP from 'koa-graphql';

export default (options) => {
  // 设置中间件默认参数
  let defaultOptions = {
    endpoint: '/graphql'
  };

  if (process.env.NODE_ENV !== 'production') {
    const startTime = Date.now();
    defaultOptions = {
      graphiql: true,
      pretty: true,
      extensions: () => ({
        runTime: Date.now() - startTime
      }),
      formatError: ({ message, path, locations, stack }) => ({ message, path, locations, stack }),
      ...defaultOptions
    };
  }

  options = { ...defaultOptions, ...options };

  const router = new Router();
  router.all(options.endpoint, graphqlHTTP(options));
  return router.routes();
};
