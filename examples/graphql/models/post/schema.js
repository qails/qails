export default `
  type Post {
    id: ID
  }

  type Query {
    posts(withRelated: [String], page: Int, pageSize: Int, limit: Int, offset: Int): [Post]
    post(id: ID!, withRelated: [String]): Post
  }
`;
