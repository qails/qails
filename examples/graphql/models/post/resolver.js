import { fetchList, fetchItem } from 'qails';
import Post from './model';

export default {
  Query: {
    posts: async (_, args) => {
      return await fetchList(Post, args);
    },
    post: async (_, { id, ...args }) => {
      return await fetchItem(Post, id, args);
    }
  }
};
