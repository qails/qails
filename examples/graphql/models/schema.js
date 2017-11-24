/**
 * 该文件存放公共 schema
 */
export default `
  interface Model {
    id: ID
  }

  interface List {
    pagination: Pagination
  }

  # 通用分页信息
  type Pagination {
    rowCount: Int
    pageCount: Int
    page: Int
    pageSize: Int
    offset: Int
    limit: Int
  }
`;
