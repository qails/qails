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
