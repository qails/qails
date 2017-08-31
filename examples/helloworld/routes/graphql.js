import { buildSchema } from 'graphql';
import Router from 'koa-router';
import graphqlHTTP from 'koa-graphql';
import { randomBytes } from 'crypto';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }

  type Query {
    hello: String
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
    rollDice(numDice: Int!, numSides: Int): [Int]
    getDie(numSides: Int): RandomDie
    getMessage(id: ID!): Message
    getMessages(): [Message]
  }
`);

// This class implements the RandomDie GraphQL type
class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({ numRolls }) {
    const output = [];
    for (let i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}

class Message {
  constructor(id, { content, author }) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

const fakeDatabase = {};

// The root provides a resolver function for each API endpoint
const root = {
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
  },
  getDie: ({ numSides }) => { // eslint-disable-line
    return new RandomDie(numSides || 6);
  },
  getMessage: ({ id }) => {
    if (!fakeDatabase[id]) {
      throw new Error(`no message exists with id ${id}`);
    }
    return new Message(id, fakeDatabase[id]);
  },
  getMessages: () => Object.keys(fakeDatabase).map(key => new Message(key, fakeDatabase[key])),
  createMessage: ({ input }) => {
    // Create a random id for our "database".
    const id = randomBytes(10).toString('hex');

    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  updateMessage: ({ id, input }) => {
    if (!fakeDatabase[id]) {
      throw new Error(`no message exists with id ${id}`);
    }
    // This replaces all old data, but some apps might want partial update.
    fakeDatabase[id] = input;
    return new Message(id, input);
  }
};

const router = new Router();
router.all('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}));

export default router;
