/**
 * 本文件封装对对象CRUD的公用方法，这些方法适用于 REST 和 GrapQL
 * 本文件中所有方法不做异常处理，所有异常都抛到上层调用的文件（resource.js和graphql.js）中处理
 */

/* eslint import/prefer-default-export: 0 */
import { isObject, isFunction } from 'util';
import { chunk, startsWith } from 'lodash';
import { snake } from './magicCase';

export const readList = async (Model, query) => {
  const model = Model.forge();
  const { embed, withRelated, mask, page, pageSize, limit, offset } = query;
  let { where, andWhere, orWhere, sort } = query;
  let fetchParams = { require: true };
  let result = {};

  if (model.magicCase) {
    if (sort) {
      if (startsWith(sort, '-')) {
        sort = `-${snake(sort.substr(1, sort.length))}`;
      } else {
        sort = snake(sort);
      }
    }
    if (where) {
      where = snake(where);
    }
    if (andWhere) {
      andWhere = snake(andWhere);
    }
    if (orWhere) {
      orWhere = snake(orWhere);
    }
  }

  if (embed || withRelated) {
    fetchParams.withRelated = (embed || withRelated).split(',');
  }

  if (where) {
    // where=id\&where=\>\&where=1
    if (Array.isArray(where)) {
      chunk(where, 3).forEach((item) => {
        // 确保拆分后的数组是一个完整的 where 条件
        if (item.length === 3) {
          model.query(...['where'].concat(item));
        }
      });
    } else if (isObject(where)) {
      // where[name]=sales
      model.where(where);
    }
  }

  if (orWhere) {
    if (Array.isArray(orWhere)) {
      chunk(orWhere, 3).forEach((item) => {
        // 确保拆分后的数组是一个完整的 where 条件
        if (item.length === 3) {
          model.query(...['orWhere'].concat(item));
        }
      });
    } else if (isObject(orWhere)) {
      model.query({ orWhere });
    }
  }

  if (andWhere) {
    if (Array.isArray(andWhere)) {
      chunk(andWhere, 3).forEach((item) => {
        // 确保拆分后的数组是一个完整的 where 条件
        if (item.length === 3) {
          model.query(...['andWhere'].concat(item));
        }
      });
    } else if (isObject(andWhere)) {
      model.query({ andWhere });
    }
  }

  // Order by support
  if (sort) {
    sort.split(',').forEach((field) => {
      model.orderBy(field);
    });
  }

  let items;
  // Pagination support
  if (page || pageSize || limit || offset) {
    if (page || pageSize) {
      fetchParams = {
        page,
        pageSize,
        ...fetchParams
      };
    } else {
      fetchParams = {
        limit,
        offset,
        ...fetchParams
      };
    }

    items = await model.fetchPage(fetchParams);
    result.pagination = items.pagination;
    result.list = mask && isFunction(items.mask) ? items.mask(mask) : items.toJSON();
  } else {
    items = await model.fetchAll(fetchParams);
    result = mask && isFunction(items.mask) ? items.mask(mask) : items.toJSON();
  }
  return result;
};

export const readItem = async (Model, id, query) => {
  const model = Model.forge();
  const { embed, mask, withRelated } = query;
  const fetchParams = { require: true };

  if (embed || withRelated) {
    fetchParams.withRelated = (embed || withRelated).split(',');
  }

  const item = await model.query(
    q => q.where({ [Model.prototype.idAttribute]: id })
  ).fetch(fetchParams);

  const result = mask ? item.mask(mask) : item.toJSON();

  return result;
};

export const createItem = async (Model, attributes) => {
  const model = Model.forge();
  if (model.magicCase) {
    attributes = snake(attributes);
  }
  const item = await model.save(attributes);
  return item.toJSON();
};

export const updateItem = async (Model, id, attributes) => {
  const { idAttribute } = Model.prototype;
  const model = Model.forge({ [idAttribute]: id });
  if (model.magicCase) {
    attributes = snake(attributes);
  }
  const item = await model.save(attributes, {
    method: 'update',
    patch: false
  });
  return item.toJSON();
};

export const deleteItem = async (Model, id) => {
  const { idAttribute } = Model.prototype;
  const model = Model.forge({ id });
  const item = await model.query(q => q.where({ [idAttribute]: id })).fetch({ require: true });
  const result = item.toJSON();
  await item.destroy();
  return result;
};
