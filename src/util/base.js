import knex from 'knex';
import bookshelf from 'bookshelf';
import modelBase from 'bookshelf-modelbase';
import cascadeDelete from 'bookshelf-cascade-delete';
import mask from 'bookshelf-mask';
import uuid from 'bookshelf-uuid';
import jsonColumns from 'bookshelf-json-columns';
import magicCase from './magic-case';

const {
  KNEX_CLIENT = 'mysql',
  MYSQL_HOST = 'localhost',
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = '',
  MYSQL_DATABASE = 'test',
  MYSQL_PORT = '3306',
  MODEL_VIRTUALS = 'true',
  MODEL_VISIBILITY = 'true',
  MODEL_PAGINATION = 'true',
  MODEL_CASCADEDELETE = 'true',
  MODEL_MASK = 'true',
  MODEL_UUID = 'true',
  MODEL_JSONCOLUMNS = 'true',
  MODEL_MAGICCASE = 'true'
} = process.env;

const base = bookshelf(knex({
  client: KNEX_CLIENT,
  connection: {
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: MYSQL_PORT
  }
}));

// 让 Model 具有返回虚拟字段的功能
if (MODEL_VIRTUALS === 'true') {
  base.plugin('virtuals');
}

// 让 Model 调用 toJSON 方法时具有显示／隐藏某些字段的功能
if (MODEL_VISIBILITY === 'true') {
  base.plugin('visibility');
}

// 让 Model 具有时间戳、数据校验和部分CURD功能
base.plugin(modelBase.pluggable);

// 让 Model 具有分页功能
if (MODEL_PAGINATION === 'true') {
  base.plugin('pagination');
}

// 让 Model 具有删除关联数据功能
if (MODEL_CASCADEDELETE === 'true') {
  base.plugin(cascadeDelete);
}

// 让 Model 具有返回自定义字段的功能
if (MODEL_MASK === 'true') {
  base.plugin(mask);
}

// 让 Model 具有自动生成UUID的功能
if (MODEL_UUID === 'true') {
  base.plugin(uuid);
}

// 让 Model 具有自动存储序列化对象的能力
if (MODEL_JSONCOLUMNS === 'true') {
  base.plugin(jsonColumns);
}

// 让 Model 具有自动转换对象 key 拼写的能力
if (MODEL_MAGICCASE === 'true') {
  base.plugin(magicCase);
}

// 外部可以base.knex取到knex client
export default base;
export const Model = base.Model;
export const Collection = base.Collection;
