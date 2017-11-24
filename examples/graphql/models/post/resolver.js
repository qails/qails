import { fetchList, fetchItem } from 'qails';
import Post from './model';

export default {
  Query: {
    posts: async (_, query) => {
      return await fetchList(Post, query);
    },
    post: async (_, { id, ...query }) => {
      return await fetchItem(Post, id, query);
    }
  }
};
