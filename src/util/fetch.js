import { isObject } from 'util';
import { chunk, startsWith } from 'lodash';
import { snake } from './magicCase';

export default '';

export const fetchAll = async (Model, query) => {
  const model = Model.forge();
  const { embed, withRelated, mask, page, pageSize, limit, offset } = query;
  let { where, andWhere, orWhere, sort } = query;
  let fetchParams = { required: false };
  let code = 0;
  let message = 'Success';
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

    await model
      .fetchPage(fetchParams)
      .then((items) => {
        if (mask) {
          result = {
            pagination: items.pagination,
            list: items.mask(mask)
          };
        } else {
          result = {
            pagination: items.pagination,
            list: items.toJSON()
          };
        }
      })
      .catch((e) => {
        code = 500;
        message = e.toString();
      });
  } else {
    await model
      .fetchAll(fetchParams)
      .then((items) => {
        if (mask) {
          result = items.mask(mask);
        } else {
          result = items.toJSON();
        }
      })
      .catch((e) => {
        code = 500;
        message = e.toString();
      });
  }
  return { code, message, result };
};

export const fetchOne = async (Model, id, query) => {
  const model = Model.forge();
  const { embed, mask, withRelated } = query;
  const fetchParams = { required: true };

  let code = 0;
  let message = 'Success';
  let result = {};

  if (embed || withRelated) {
    fetchParams.withRelated = (embed || withRelated).split(',');
  }

  const item = await model.query(
    q => q.where({ [Model.prototype.idAttribute]: id })
  ).fetch(fetchParams);

  if (item) {
    result = mask ? item.mask(mask) : item.toJSON();
  } else {
    code = 404;
    message = 'Not found';
  }

  return { code, message, result };
};
