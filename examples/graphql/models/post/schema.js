export default `
  type Post implements Model {
    id: ID
  }

  type Posts implements List {
    pagination: Pagination
    list: [Post]
  }

  type Query {
    posts(withRelated: String, where: String, andWhere: String, orWhere: String, sort: String, page: Int, pageSize: Int, limit: Int, offset: Int, first: Int): Posts
    post(id: ID!, withRelated: String): Post
  }
`;
