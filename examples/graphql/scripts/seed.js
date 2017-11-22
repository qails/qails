/**
 * 创建表和数据初始化脚本
 */

/* eslint import/first: 0 */
import '../dotenv';
import { base } from 'qails';
import { range } from 'lodash';
import casual from 'casual';

const ROW_COUNT = 15;
const TABLE_USERS = 'users';
const TABLE_POSTS = 'posts';

const seed = async () => {
  await base.knex.schema
    .dropTableIfExists(TABLE_USERS)
    .createTable(TABLE_USERS, (table) => {
      table.increments();
      table.string('name');
    })
    .dropTableIfExists(TABLE_POSTS)
    .createTable(TABLE_POSTS, (table) => {
      table.increments();
      table.integer('user_id');
    });

  await base.knex(TABLE_USERS)
    .insert(range(1, ROW_COUNT + 1).map(item => ({
      id: item,
      name: casual.word
    })));

  await base.knex(TABLE_POSTS)
    .insert(range(1, ROW_COUNT + 1).map(item => ({
      user_id: item
    })));
};

seed().then(() => {
  console.log('Database initialization successful.');
  process.exit(0);
}, (e) => {
  console.log(e);
});
