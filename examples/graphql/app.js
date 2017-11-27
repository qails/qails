import { resolve } from 'path';
import {
  Qails,
  accessLogMiddleware,
  bodyParserMiddleware,
  prettyJsonMiddleware,
  graphqlMiddleware
} from 'qails';
import { makeExecutableSchema } from 'graphql-tools';
import { typeDefs, resolvers } from './util/mergeGraphqlSchema';


const port = 12345;
const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = new Qails([
  accessLogMiddleware(),
  bodyParserMiddleware(),
  prettyJsonMiddleware(),
  graphqlMiddleware({
    schema: executableSchema
  })
]);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`✅ qails listening on port ${port}`);
});
