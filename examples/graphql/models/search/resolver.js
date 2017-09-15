export default {
  Query: {
    search: () => (Math.random() > 0.5 ? {
      errorNo: 0,
      result: 'Success'
    } : {
      errorNo: 1,
      result: 'Fail'
    })
  },
  SearchResult: {
    __resolveType(obj) {
      if (obj.result) {
        return 'Success';
      }
      if (obj.message) {
        return 'Fail';
      }
      return null;
    }
  }
};
