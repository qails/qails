/* eslint complexity: 0 */
import { startsWith } from 'lodash';

export const fetchModels = Model => (obj, options) => new Promise((resolve, reject) => {
  const {
    page,
    pageSize,
    offset,
    limit,
    first,
    after,
    sort,
    where,
    withRelated
  } = options;
  let fetchOptions = {};

  if (withRelated) {
    // eslint-disable-next-line
    const { name, sort, where, first } = withRelated;
    fetchOptions.withRelated = {
      [name]: (query) => {
        if (where) {
          query.where(...[].concat(where));
        }
        if (first) {
          query.limit(first);
        }
        if (sort) {
          let fields = sort;
          if (!Array.isArray(fields)) {
            fields = [fields];
          }
          fields.forEach((field) => {
            let order = 'ASC';
            if (startsWith(field, '-')) {
              order = 'DESC';
              field = field.substr(1, field.length);
            }
            query.orderBy(field, order);
          });
        }
      }
    };
  }
  if (first || after) {
    fetchOptions = {
      limit: first,
      offset: after,
      ...fetchOptions
    };
  } else if (page || pageSize) {
    fetchOptions = { page, pageSize, ...fetchOptions };
  } else if (offset || limit) {
    fetchOptions = { limit, offset, ...fetchOptions };
  }

  if (sort) {
    let sortBy = sort;
    if (!Array.isArray(sortBy)) {
      sortBy = [sortBy];
    }
    sortBy.forEach((field) => {
      let order = 'ASC';
      if (startsWith(field, '-')) {
        order = 'DESC';
        field = field.substr(1, field.length);
      }
      Model = Model.forge().orderBy(field, order);
    });
  }

  if (where) {
    Model = Model.query(...['where'].concat(where));
  }

  Model.fetchPage(fetchOptions).then((items) => {
    resolve({
      pagination: items.pagination,
      // totalCount: items.pagination.rowCount,
      // pageInfo: {
      //   count: items.pagination.pageCount,
      //   page: items.pagination.page,
      //   limit: items.pagination.pageSize,
      //   hasNextPage: items.pagination.page < items.pagination.pageCount,
      //   hasPrevPage: items.pagination.page > 1
      // },
      // cursor: '',
      edges: items.toJSON()
    });
  }).catch(err => reject(err));

  // 清除本次查询条件
  if (Model.resetQuery) {
    Model.resetQuery();
  }
});

export const fetchModel = Model => (obj, { id, withRelated }) => new Promise((resolve, reject) => {
  Model.findById(id, { withRelated }).then((items) => {
    resolve(items.toJSON());
  }).catch(err => reject(err));
});

export const updateModel = Model => (obj, { id, input }) => new Promise((resolve, reject) => {
  Model.update(input, { id }).then((items) => {
    resolve(items.toJSON());
  }).catch(err => reject(err));
});

export const deleteModel = Model => (obj, { id }) => new Promise((resolve, reject) => {
  Model.findById(id).then((items) => {
    items.destroy().then(() => {
      resolve(0);
    });
  }).catch(err => reject(err));
});
