// {
//   users(first:3) {
//     nodes {
//       id
//       name
//       posts(first:2) {
//         nodes {
//           id
//         }
//       }
//     }
//   }
// }

export default `
  input UserInput {
    name: String
  }

  # 用户模型类
  type User implements Node {
    id: ID
    name: String
    posts(first: Int): Posts
  }

  type Users implements Collection {
    pagination: Pagination
    nodes: [User]
  }

  type Query {
    # 搜索用户列表
    users(withRelated: String, where: String, andWhere: String, orWhere: String, sort: String, page: Int, pageSize: Int, limit: Int, offset: Int, first: Int): Users
    # 获取用户详情
    user(id: ID!, withRelated: String): User
  }

  type Mutation {
    # 新增用户
    createUser(input: UserInput): User
    # 修改用户
    updateUser(id: ID!, input: UserInput): User
    # 删除用户
    deleteUser(id: ID!): Int
  }

`;
