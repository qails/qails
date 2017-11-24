import { fetchList, fetchItem, create, update, destroy } from 'qails';
import User from './model';
import Post from '../post/model';

export default {
  User: {
    async posts(parent, args) {
      args = {...args, where: { user_id: parent.id } };
      return await fetchList(Post, args);
    }
  },
  Query: {
    users: async (_, query) => {
      return await fetchList(User, query);
    },
    user: async (_, { id, ...query }) => {
      return await fetchItem(User, id, query);
    }
  },
  Mutation: {
    createUser: async (_, { input }) => {
      return await create(User, input);
    },
    updateUser: async (_, { id, input }) => {
      return await update(User, id, input);
    },
    deleteUser: async (_, { id }) => {
      return await destroy(User, id);
    }
  }
};
