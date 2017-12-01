/**
 * 该文件存放公共 schema
 */
export default `
  # 通用模型节点接口
  interface Node {
    id: ID
  }

  # 通用列表接口
  interface Collection {
    pagination: Pagination
  }

  ### 通用分页信息
  # 可以通过下面两种方式来分页：
  # - \`page\` 和 \`pageSize\`
  # - \`offset\` 和 \`limit\`
  type Pagination {
    # 记录总数
    rowCount: Int

    # 页面总数
    pageCount: Int

    # 当前页数
    page: Int

    # 每页显示的记录条数
    pageSize: Int

    # 游标起始偏移的位置
    offset: Int

    # 限制单次查询允许返回的记录数
    limit: Int
  }
`;
