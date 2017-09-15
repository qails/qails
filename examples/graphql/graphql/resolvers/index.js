import { mergeResolvers } from 'merge-graphql-schemas';
import { resolver as hotel } from '../../models/hotel';
import { resolver as room } from '../../models/room';
import { resolver as search } from '../../models/search';
import { resolver as language } from '../../models/language';

export default mergeResolvers([
  hotel,
  room,
  search,
  language
]);
