/**
 * ./crud.js到 REST APIs 的适配器文件
 * 无论服务器是否发生错误，均返回 statusCode = 200
 * 当使用 envelope 时，均返回 { code: 200, message: 'Success' }
 * 错误信息会返回在 ctx.body 中，格式因错误类型不同而不同
 */

import Router from 'koa-router';
import compose from 'koa-compose';
import { defaults, isFunction, compact } from 'lodash';
import { readList, readItem, createItem, updateItem, deleteItem } from './crud';

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
      // name: tableName,
      prefix: '',
      root: `/${tableName}`
    });
    super(options);
    this.prefix(options.prefix);
    this.model = model;
    this.options = options;

    this.pattern = {
      root: options.root,
      item: `${options.root}/:id`
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
        const attributes = ctx.request.body;
        ctx.state.code = 0;
        ctx.state.message = 'Success';
        try {
          ctx.body = await createItem(this.model, attributes);
        } catch (e) {
          ctx.body = e; // ctx.body 必须是一个对象
        }
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
    const { pattern } = this;
    const listMiddleware = async (ctx, next) => {
      ctx.state.code = 0;
      ctx.state.message = 'Success';
      try {
        ctx.body = await readList(this.model, ctx.query);
      } catch (e) {
        ctx.body = e;
      }
      await next();
    };

    const itemMiddleware = async (ctx, next) => {
      ctx.state.code = 0;
      ctx.state.message = 'Success';
      try {
        ctx.body = await readItem(this.model, ctx.params.id, ctx.query);
      } catch (e) {
        ctx.body = e;
      }
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
    const { pattern } = this;
    this.methods.update = true;

    let updateMiddleware = null;
    if (isFunction(middleware)) {
      updateMiddleware = middleware;
    } else {
      updateMiddleware = async (ctx, next) => {
        const { id } = ctx.params;
        const attributes = ctx.request.body;
        ctx.state.code = 0;
        ctx.state.message = 'Success';
        try {
          ctx.body = await updateItem(this.model, id, attributes);
        } catch (e) {
          ctx.body = e;
        }
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
    const { pattern } = this;
    this.methods.destroy = true;

    let deleteMiddleware = null;
    if (isFunction(middleware)) {
      deleteMiddleware = middleware;
    } else {
      deleteMiddleware = async (ctx, next) => {
        const { id } = ctx.params;
        ctx.state.code = 0;
        ctx.state.message = 'Success';
        try {
          ctx.body = await deleteItem(this.model, id);
        } catch (e) {
          ctx.body = e;
        }
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
