import casual from 'casual';
import { random, range } from 'lodash';

const HOTELS_AMT = 20;
const ROOMS_AMT = 60;

exports.seed = knex => knex('hotels').truncate()
  .then(() => {
    const todos = range(HOTELS_AMT).map(() => ({
      name: casual.title
    }));
    return knex('hotels').insert(todos);
  })
  .then(() => knex('rooms').truncate())
  .then(() => {
    const rooms = range(ROOMS_AMT).map(() => ({
      name: casual.word,
      hotelId: random(1, HOTELS_AMT)
    }));
    return knex('rooms').insert(rooms);
  })
;
