export default `
  interface Result {
    errorNo: Int
  }

  union SearchResult = Success | Fail

  type Success implements Result {
    errorNo: Int
    result: String
  }

  type Fail implements Result {
    errorNo: Int
    message: String
  }

  type Query {
    search: SearchResult
  }
`;
