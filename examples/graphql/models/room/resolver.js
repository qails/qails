import Room from './model';
import { fetchModels, fetchModel } from '../../../../src';

export default {
  Query: {
    rooms: fetchModels(Room),
    room: fetchModel(Room)
  }
};
