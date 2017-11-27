export default `
  input UserInput {
    name: String
  }

  type User implements Model {
    id: ID
    name: String
    posts(first: Int): Posts
  }

  type Users implements List {
    pagination: Pagination
    list: [User]
  }

  type Query {
    users(withRelated: String, where: String, andWhere: String, orWhere: String, sort: String, page: Int, pageSize: Int, limit: Int, offset: Int, first: Int): Users
    user(id: ID!, withRelated: String): User
  }

  type Mutation {
    createUser(input: UserInput): User
    updateUser(id: ID!, input: UserInput): User
    deleteUser(id: ID!): Int
  }

`;
