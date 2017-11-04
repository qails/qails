import Router from 'koa-router';
import compose from 'koa-compose';
import { defaults, isFunction, compact } from 'lodash';
import { snake } from './magicCase';
import { fetchAll, fetchOne } from './fetch';

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
      // id: 'id',
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
        const model = this.model.forge();
        const attributes = model.magicCase ? snake(ctx.request.body) : ctx.request.body;
        const result = await model.save(attributes);
        ctx.status = 201;
        ctx.state.code = 0;
        ctx.state.message = 'Success';
        ctx.body = result;
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
      const { code, message, result } = await fetchAll(this.model, ctx.query);

      ctx.status = 200;
      ctx.state.code = code;
      ctx.state.message = message;
      ctx.body = result;
      await next();
    };

    const itemMiddleware = async (ctx, next) => {
      const { code, message, result } = await fetchOne(
        this.model,
        ctx.params.id,
        ctx.query
      );

      ctx.status = 200;
      ctx.state.code = code;
      ctx.state.message = message;
      ctx.body = result;
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
        const model = this.model.forge();
        const attributes = model.magicCase ? snake(ctx.request.body) : ctx.request.body;
        const item = await model
          .query(q => q.where({ [this.model.prototype.idAttribute]: ctx.params.id }))
          .fetch({ required: true });
        if (item) {
          const result = await item.save(attributes, {
            method: 'update',
            patch: true
          });
          ctx.state.code = 0;
          ctx.state.message = 'Success';
          ctx.body = result;
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
    const { pattern } = this;
    this.methods.destroy = true;

    let deleteMiddleware = null;
    if (isFunction(middleware)) {
      deleteMiddleware = middleware;
    } else {
      deleteMiddleware = async (ctx, next) => {
        const model = this.model.forge();
        const item = await model
          .query(q => q.where({ [this.model.prototype.idAttribute]: ctx.params.id }))
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
