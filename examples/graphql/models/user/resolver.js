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
    users: async (_, args) => {
      return await fetchList(User, args);
    },
    user: async (_, { id, ...args }) => {
      return await fetchItem(User, id, args);
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
