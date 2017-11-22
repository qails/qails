export default `
  input UserInput {
    name: String
  }

  interface Model {
    id: ID
  }

  type User implements Model {
    id: ID
    name: String
    posts: [Post]
  }

  type Query {
    users(withRelated: [String], page: Int, pageSize: Int, limit: Int, offset: Int): [User]
    user(id: ID!, withRelated: [String]): User
  }

  type Mutation {
    createUser(input: UserInput): User
    updateUser(id: ID!, input: UserInput): User
    deleteUser(id: ID!): Int
  }

`;
