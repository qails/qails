import { join } from 'path';
import {
  Qails,
  accessLogMiddleware,
  bodyParserMiddleware,
  corsMiddleware,
  prettyJsonMiddleware,
  graphqlMiddleware
} from 'qails';
import { makeExecutableSchema } from 'graphql-tools';
import { mergeResolvers, mergeTypes, fileLoader } from 'merge-graphql-schemas';

const port = 12345;
const fullpath = pattern => join(__dirname, pattern);
const typesArray = fileLoader(fullpath('models/**/schema.js'));
const resolversArray = fileLoader(fullpath('models/**/resolver.js'));
const executableSchema = makeExecutableSchema({
  typeDefs: mergeTypes(typesArray),
  resolvers: mergeResolvers(resolversArray)
});

const app = new Qails([
  accessLogMiddleware(),
  bodyParserMiddleware(),
  corsMiddleware(),
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
