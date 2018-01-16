import knex from 'knex';
import bookshelf from 'bookshelf';
import modelBase from 'bookshelf-modelbase';
import cascadeDelete from 'bookshelf-cascade-delete-fix';
import mask from 'bookshelf-mask';
import uuid from 'bookshelf-uuid';
import jsonColumns from 'bookshelf-json-columns-fix';
import paranoia from 'bookshelf-paranoia';
import magicCase from './magicCase';

const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT,
  MODEL_REGISTRY,
  MODEL_VIRTUALS,
  MODEL_VISIBILITY,
  MODEL_CASCADEDELETE,
  MODEL_MASK,
  MODEL_UUID,
  MODEL_UUID_TYPE = 'v4',
  MODEL_JSONCOLUMNS,
  MODEL_MAGICCASE,
  MODEL_SOFTDELETE,
  MYSQL_POOL_IDEL_TIMEOUT_MILLIS,
  MYSQL_POOL_EVICTION_RUN_INTERVAL_MILLIS
} = process.env;

const pool = {
  idleTimeoutMillis: MYSQL_POOL_IDEL_TIMEOUT_MILLIS,
  evictionRunIntervalMillis: MYSQL_POOL_EVICTION_RUN_INTERVAL_MILLIS
};

const base = bookshelf(knex({
  client: 'mysql',
  connection: {
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: MYSQL_PORT
  },
  pool
}));


// 让 Model 具有时间戳、数据校验和部分CRUD功能
base.plugin(modelBase.pluggable);

// 让 Model 具有分页功能
base.plugin('pagination');

// 让 Model 具有自动注册到中央位置的功能
if (MODEL_REGISTRY === 'true') {
  base.plugin('registry');
}

// 让 Model 具有返回虚拟字段的功能
if (MODEL_VIRTUALS === 'true') {
  base.plugin('virtuals');
}

// 让 Model 调用 toJSON 方法时具有显示／隐藏某些字段的功能
if (MODEL_VISIBILITY === 'true') {
  base.plugin('visibility');
}

// 让 Model 具有软删除记录的能力
// 注意：加载顺序必须是 paranoia -> cascadeDelete，否则会有 bug
if (MODEL_SOFTDELETE === 'true') {
  // field 参数改到 model 中设置
  base.plugin(paranoia);
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
  base.plugin(uuid, { type: MODEL_UUID_TYPE });
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
export const { Model } = base;
