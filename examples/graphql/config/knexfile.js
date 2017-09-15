/**
 * 该文件仅供 knex-cli 使用
 * model 中的数据库配置信息是直接从 .env 中获取
 */
require('dotenv').config({ path: '../.env' });

const {
  KNEX_CLIENT,
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT,
  NODE_ENV
} = process.env;

module.exports = {
  client: KNEX_CLIENT,
  connection: {
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: MYSQL_PORT,
    charset: 'utf8',
    debug: NODE_ENV === 'local'
  },
  migrations: {
    tableName: 'migrations',
    directory: '../migrations'
  },
  seeds: {
    directory: '../seeds'
  }
};
