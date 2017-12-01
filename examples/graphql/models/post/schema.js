export default `
  type Post implements Node {
    id: ID
  }

  type Posts implements Collection {
    pagination: Pagination
    nodes: [Post]
  }

  type Query {
    # 搜索文章列表
    posts(withRelated: String, where: String, andWhere: String, orWhere: String, sort: String, page: Int, pageSize: Int, limit: Int, offset: Int, first: Int): Posts
    # 获取文章详情
    post(id: ID!, withRelated: String): Post
  }
`;
