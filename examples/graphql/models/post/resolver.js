import { fetchList, fetchItem } from 'qails';
import Post from './model';

export default {
  Query: {
    posts: async (_, query) => {
      const posts = await fetchList(Post, query);
      return posts;
    },
    post: async (_, { id, ...query }) => {
      const post = await fetchItem(Post, id, query);
      return post;
    }
  }
};
