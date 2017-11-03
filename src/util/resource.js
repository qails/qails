import { isObject } from 'util';
import Router from 'koa-router';
import compose from 'koa-compose';
import { defaults, isFunction, compact, chunk, startsWith } from 'lodash';
import { snake } from './magicCase';

/**
 * @class
 */
export default class ResourceRouter extends Router {
  methods = { create: false, read: false, update: false, destroy: false }

  /**
   * @static
   * @param {Object} options
   * @return {Router}
   */
  static define(model, options = {}) {
    const { setup = router => router.crud(), ...rest } = options;
    options = rest;
    const router = new this(model, options);
    setup(router);
    return router;
  }

  /**
   * @constructor
   * @param {Model} model
   * @param {Object} options
   */
  constructor(model, options) {
    const { tableName } = model.prototype;
    options = defaults(options, {
      name: tableName,
      prefix: '',
      id: 'id',
      root: `/${tableName}`
    });
    super(options);
    this.prefix(options.prefix);
    this.model = model;
    this.options = options;

    this.pattern = {
      root: options.root,
      item: `${options.root}/:${options.id}`
    };
  }

  /**
   * Create a new record
   * @param {Object|Function} middleware
   * @param {Object} options
   * @return {Object}
   */
  create(middleware, options) {
    this.methods.create = true;

    const { pattern: { root } } = this;
    let createMiddleware = null;
    if (isFunction(middleware)) {
      createMiddleware = middleware;
    } else {
      createMiddleware = async (ctx, next) => {
        const model = this.model.forge();
        const attributes = model.magicCase ? snake(ctx.request.body) : ctx.request.body;
        await model.save(attributes);
        ctx.status = 201;
        ctx.state.code = 0;
        ctx.state.message = 'Success';
        ctx.body = ctx.state.resource;
        await next();
      };
      options = middleware;
    }

    const { beforeMiddlewares, afterMiddlewares } = options || {};
    const applyCreateMiddlewares = compact([].concat(
      beforeMiddlewares,
      createMiddleware,
      afterMiddlewares
    ));
    this.post(root, compose(applyCreateMiddlewares));
    return this;
  }

  /**
   * Read records
   * @param {Object} options
   * @return {Object}
   */
  read(options) {
    this.methods.read = true;
    const { options: { id }, pattern } = this;
    const listMiddleware = async (ctx, next) => {
      const model = this.model.forge();
      const { embed, withRelated, mask, page, pageSize, limit, offset } = ctx.query;

      let { where, andWhere, orWhere, sort } = ctx.query;
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

      ctx.status = 200;
      ctx.state.code = code;
      ctx.state.message = message;
      ctx.body = result;
      await next();
    };

    const itemMiddleware = async (ctx, next) => {
      const model = this.model.forge();
      const { embed, mask, withRelated } = ctx.query;
      const fetchParams = { required: true };
      if (embed || withRelated) {
        fetchParams.withRelated = (embed || withRelated).split(',');
      }

      // const item = await collection(ctx)
      const item = await model
        .query(q => q.where({ [id]: ctx.params.id }))
        .fetch(fetchParams);

      if (item) {
        ctx.state.code = 0;
        ctx.state.message = 'Success';
        ctx.body = mask ? item.mask(mask) : item.toJSON();
      } else {
        ctx.state.code = 404;
        ctx.state.message = 'Not found';
      }
      ctx.status = 200;
      await next();
    };

    const {
      beforeMiddlewares,
      afterMiddlewares,
      beforeListRouter,
      afterListRouter,
      beforeItemRouter,
      afterItemRouter
    } = options || {};
    const applyListMiddlewares = compact([].concat(
      beforeListRouter,
      beforeMiddlewares,
      listMiddleware,
      afterListRouter,
      afterMiddlewares
    ));
    const applyItemMiddlewares = compact([].concat(
      beforeItemRouter,
      beforeMiddlewares,
      itemMiddleware,
      afterItemRouter,
      afterMiddlewares
    ));

    // read list
    this.get(pattern.root, compose(applyListMiddlewares));
    // read item
    this.get(pattern.item, compose(applyItemMiddlewares));

    return this;
  }

  /**
   * Update record
   * @param {Object|Function} middleware
   * @param {Object} options
   * @return {Object}
   */
  update(middleware, options) {
    const { options: { id }, pattern } = this;
    this.methods.update = true;

    let updateMiddleware = null;
    if (isFunction(middleware)) {
      updateMiddleware = middleware;
    } else {
      updateMiddleware = async (ctx, next) => {
        const model = this.model.forge();
        const attributes = model.magicCase ? snake(ctx.request.body) : ctx.request.body;
        const item = await model
          .query(q => q.where({ [id]: ctx.params.id }))
          .fetch({ required: true });
        if (item) {
          const updatedResource = await item.save(attributes, {
            method: 'update',
            patch: true
          });
          ctx.state.code = 0;
          ctx.state.message = 'Success';
          ctx.body = updatedResource;
        } else {
          ctx.state.code = 404;
          ctx.state.message = 'Not found';
        }
        ctx.status = 202;
        await next();
      };
      options = middleware;
    }

    const { beforeMiddlewares, afterMiddlewares } = options || {};
    const applyUpdateMiddlewares = compact([].concat(
      beforeMiddlewares,
      updateMiddleware,
      afterMiddlewares
    ));
    this.put(pattern.item, compose(applyUpdateMiddlewares));
    this.patch(pattern.item, compose(applyUpdateMiddlewares));

    return this;
  }

  /**
   * Remove a record
   * @param {Object|Function} middleware
   * @param {Object} options
   * @return {Object}
   */
  destroy(middleware, options) {
    const { pattern, options: { id } } = this;
    this.methods.destroy = true;

    let deleteMiddleware = null;
    if (isFunction(middleware)) {
      deleteMiddleware = middleware;
    } else {
      deleteMiddleware = async (ctx, next) => {
        const model = this.model.forge();
        const item = await model
          .query(q => q.where({ [id]: ctx.params.id }))
          .fetch({ required: true });
        if (item) {
          ctx.body = await item.destroy();
        } else {
          ctx.state.code = 404;
          ctx.state.message = 'Not found';
        }
        ctx.status = 204;
        await next();
      };
      options = middleware;
    }

    const { beforeMiddlewares, afterMiddlewares } = options || {};
    const applyDeleteMiddlewares = compact([].concat(
      beforeMiddlewares,
      deleteMiddleware,
      afterMiddlewares
    ));

    this.del(pattern.item, compose(applyDeleteMiddlewares));
    return this;
  }

  /**
   * Auto generate CRUD
   * @method
   * @return {Object}
   */
  crud() {
    return this.create().read().update().destroy();
  }
}
