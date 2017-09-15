import Hotel from './model';
import { fetchModels, fetchModel, updateModel, deleteModel } from '../../../../src';

export default {
  Query: {
    hotels: fetchModels(Hotel),
    hotel: fetchModel(Hotel)
  },
  Mutation: {
    updateHotel: updateModel(Hotel),
    deleteHotel: deleteModel(Hotel)
  }
};
