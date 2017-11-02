import Knex from 'knex';
import bookshelf from 'bookshelf';
import modelBase from 'bookshelf-modelbase';
import cascadeDelete from 'bookshelf-cascade-delete-fix';
import mask from 'bookshelf-mask';
import uuid from 'bookshelf-uuid';
import jsonColumns from 'bookshelf-json-columns-fix';
import paranoia from 'bookshelf-paranoia';
import magicCase from './magicCase';
import features from './features';

const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT
} = process.env;

const knexInstance = Knex({
  client: 'mysql',
  connection: {
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: MYSQL_PORT
  }
});

const base = bookshelf(knexInstance);

// 让 Model 具有自动注册到中央位置的功能
if (features('MODEL_REGISTRY')) {
  base.plugin('registry');
}

// 让 Model 具有返回虚拟字段的功能
if (features('MODEL_VIRTUALS')) {
  base.plugin('virtuals');
}

// 让 Model 调用 toJSON 方法时具有显示／隐藏某些字段的功能
if (features('MODEL_VISIBILITY')) {
  base.plugin('visibility');
}

// 让 Model 具有时间戳、数据校验和部分CURD功能
if (features('MODEL_BASE')) {
  base.plugin(modelBase.pluggable);
}
// 让 Model 具有分页功能
if (features('MODEL_PAGINATION')) {
  base.plugin('pagination');
}

// 让 Model 具有删除关联数据功能
if (features('MODEL_CASCADEDELETE')) {
  base.plugin(cascadeDelete);
}

// 让 Model 具有返回自定义字段的功能
if (features('MODEL_MASK')) {
  base.plugin(mask);
}

// 让 Model 具有自动生成UUID的功能
if (features('MODEL_UUID')) {
  const options = features('MODEL_UUID') === true ? null : features('MODEL_UUID');
  base.plugin(uuid, options);
}

// 让 Model 具有自动存储序列化对象的能力
if (features('MODEL_JSONCOLUMNS')) {
  base.plugin(jsonColumns);
}

// 让 Model 具有自动转换对象 key 拼写的能力
if (features('MODEL_MAGICCASE')) {
  base.plugin(magicCase);
}

// 让 Model 具有软删除记录的能力
if (features('MODEL_SOFTDELETE')) {
  const options = features('MODEL_SOFTDELETE') === true ? null : features('MODEL_SOFTDELETE');
  base.plugin(paranoia, options);
}

// 外部可以base.knex取到knex client
export default base;
export const knex = knexInstance;
export const Model = base.Model;
export const Collection = base.Collection;
