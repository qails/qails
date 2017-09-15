import { mergeTypes } from 'merge-graphql-schemas';
import { schema as hotel } from '../../models/hotel';
import { schema as room } from '../../models/room';
import { schema as search } from '../../models/search';
import { schema as language } from '../../models/language';

export default mergeTypes([
  hotel,
  room,
  search,
  language
]);
