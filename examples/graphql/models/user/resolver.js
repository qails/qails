import { fetchList, fetchItem, create, update, destroy } from 'qails';
import User from './model';

export default {
  Query: {
    users: async (_, query) => {
      const users = await fetchList(User, query);
      return users;
    },
    user: async (_, { id, ...query }) => {
      const user = await fetchItem(User, id, query);
      return user;
    }
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const user = await create(User, input);
      return user;
    },
    updateUser: async (_, { id, input }) => {
      const user = await update(User, id, input);
      return user;
    },
    deleteUser: async (_, { id }) => {
      const user = await destroy(User, id);
      return user;
    }
  }
};
