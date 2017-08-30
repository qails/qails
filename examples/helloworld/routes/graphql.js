import { buildSchema } from 'graphql';
import Router from 'koa-router';
import graphqlHTTP from 'koa-graphql';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello: String
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int],
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`);

// The root provides a resolver function for each API endpoint
const rootValue = {
  hello: () => 'Hello world!',
  quoteOfTheDay: () => (Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within'),
  random: () => Math.random(),
  rollThreeDice: () => [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 6)),
  rollDice: ({ numDice, numSides }) => {
    const output = [];
    for (let i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)));
    }
    return output;
  }
};

const router = new Router();
router.all('/graphql', graphqlHTTP({
  schema,
  rootValue,
  graphiql: true
}));

export default router;
