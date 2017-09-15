import Router from 'koa-router';
import graphqlHTTP from 'koa-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { typeDefs, resolvers } from '../graphql';

const { NODE_ENV } = process.env;
const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const router = new Router();
router.all('/graphql', graphqlHTTP(() => {
  let options = {
    schema: executableSchema
  };
  if (NODE_ENV !== 'production') {
    const startTime = Date.now();
    options = {
      ...options,
      graphiql: true,
      pretty: true,
      extensions: () => ({
        runTime: Date.now() - startTime
      }),
      formatError: error => ({
        message: error.message,
        locations: error.locations,
        stack: error.stack,
        path: error.path
      })
    };
  }
  return options;
}));

export default router;
