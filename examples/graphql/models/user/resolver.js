import { fetchList, fetchItem, create, update, destroy } from 'qails';
import User from './model';
import Post from '../post/model';

export default {
  User: {
    async posts(parent, args) {
      args = { ...args, where: { user_id: parent.id } };
      return fetchList(Post, args);
    }
  },
  Query: {
    users: async (_, args) => fetchList(User, args),
    user: async (_, { id, ...args }) => fetchItem(User, id, args)
  },
  Mutation: {
    createUser: async (_, { input }) => create(User, input),
    updateUser: async (_, { id, input }) => update(User, id, input),
    deleteUser: async (_, { id }) => destroy(User, id)
  }
};
