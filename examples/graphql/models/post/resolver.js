import { fetchList, fetchItem } from 'qails';
import Post from './model';

export default {
  Query: {
    posts: async (_, args) => fetchList(Post, args),
    post: async (_, { id, ...args }) => fetchItem(Post, id, args)
  }
};
