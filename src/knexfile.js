const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT
} = process.env;

module.exports = {
  client: 'mysql',
  connection: {
    host: MYSQL_HOST || 'localhost',
    user: MYSQL_USER || 'root',
    password: MYSQL_PASSWORD || '',
    database: MYSQL_DATABASE || 'qrmaps',
    port: MYSQL_PORT || 3306,
    charset: 'utf8',
    timezone: 'UTC'
  },
  migrations: {
    tableName: 'migrations',
    directory: '../../migrations'
  },
  seeds: {
    directory: '../../seeds'
  }
};
