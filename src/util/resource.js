import { isObject } from 'util';
import Router from 'koa-router';
import compose from 'koa-compose';
import Collection from 'bookshelf/lib/collection';
import { defaults, isFunction, compact, chunk, startsWith } from 'lodash';
import { snake } from './magic-case';
import envelope from './response-envelope';
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
  static define(options) {
    // eslint-disable-next-line
    let { collection, setup, ...rest } = options;
    if (options instanceof Function || options instanceof Collection) {
      collection = options;
      options = undefined;
    }
    options = rest || options;
    setup = setup || (router => router.crud());
    const router = new this(collection, options);
    setup(router);
    return router;
  }

  /**
   * @constructor
   * @param {Collection} collection
   * @param {Object} options
   */
  // eslint-disable-next-line
  constructor(collection, options) {
    options = defaults(options, {
      root: '',
      id: '',
      name: '',
      prefix: ''
    });
    super(options);
    this.prefix(options.prefix);
    this.collection = collection;
    if (!isFunction(collection)) {
      options.model = options.model || collection.model;
      options.id = options.id || options.model.prototype.idAttribute;
      this.collection = () => collection;
    }
    options.name = options.name || options.model.prototype.tableName;
    options.root = options.root || `/${options.name}`;
    options.title = options.title || options.name;
    options.description = options.description || options.title;
    options.id = options.id || 'id';
    this.options = options;

    this.pattern = {
      root: options.root || '/',
      item: `${options.root ? options.root : ''}/:${options.id}`
    };
  }

  /**
   * Create a new record
   * @param {Object|Function} middlewave
   * @param {Object} options
   * @return {Object}
   */
  create(middlewave, options) {
    const { collection, pattern } = this;
    this.methods.create = true;

    let createMiddlewave = null;
    if (isFunction(middlewave)) {
      createMiddlewave = middlewave;
    } else {
      createMiddlewave = async (ctx, next) => {
        const attributes = ctx.state.attributes || snake(ctx.request.body);
        if (collection(ctx).relatedData) {
          ctx.state.resource = await collection(ctx).create(attributes);
        } else {
          ctx.state.resource = collection(ctx).model.forge();
          await ctx.state.resource.save(attributes);
        }
        await next();
        ctx.status = 201;
        ctx.body = envelope({
          code: 0,
          message: 'Success',
          result: ctx.state.resource
        });
      };
      options = middlewave;
    }

    const { beforeMiddlewaves, afterMiddlewaves } = options || {};
    const applyCreateMiddlewares = compact([].concat(
      beforeMiddlewaves,
      createMiddlewave,
      afterMiddlewaves
    ));
    this.post(pattern.root, compose(applyCreateMiddlewares));
    return this;
  }

  /**
   * Read records
   * @param {Object} options
   * @return {Object}
   */
  read(options) {
    this.methods.read = true;
    const { collection, options: { id }, pattern } = this;

    // eslint-disable-next-line
    const listMiddleware = async (ctx, next) => {
      const { embed, mask, page, pageSize, limit, offset } = ctx.query;
      const model = ctx.state.query || collection(ctx).model.forge();

      let { where, andWhere, orWhere, sort } = ctx.query;
      let fetchParams = { required: false };
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

      if (embed) {
        fetchParams.withRelated = embed.split(',');
      }

      if (where) {
        // where=id\&where=\>\&where=1
        if (Array.isArray(where)) {
          model.query(...['where'].concat(where));
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
            if (items) {
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
            }
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        await model
          .fetchAll(fetchParams)
          .then((items) => {
            if (items) {
              if (mask) {
                result = items.mask(mask);
              } else {
                result = items.toJSON();
              }
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }

      await next();

      ctx.status = 200;
      ctx.body = envelope({
        code: 0,
        message: 'Success',
        result
      });
    };

    const itemMiddleware = async (ctx, next) => {
      const { embed, mask } = ctx.query;
      const fetchParams = { required: true };
      if (embed) {
        fetchParams.withRelated = embed.split(',');
      }

      const item = await collection(ctx)
        .query(q => q.where({ [id]: ctx.params.id }))
        .fetchOne(fetchParams);

      if (item) {
        ctx.state.resource = mask ? item.mask(mask) : item.toJSON();
        await next();
        ctx.body = envelope({
          code: 0,
          message: 'Success',
          result: ctx.state.resource
        });
        ctx.status = 200;
      } else {
        ctx.body = envelope({
          code: 404,
          message: 'Not found'
        });
      }
    };

    const {
      beforeMiddlewaves,
      afterMiddlewaves,
      beforeListRouter,
      afterListRouter,
      beforeItemRouter,
      afterItemRouter
    } = options || {};
    const applyListMiddlewares = compact([].concat(
      beforeListRouter,
      beforeMiddlewaves,
      listMiddleware,
      afterListRouter,
      afterMiddlewaves
    ));
    const applyItemMiddlewares = compact([].concat(
      beforeItemRouter,
      beforeMiddlewaves,
      itemMiddleware,
      afterItemRouter,
      afterMiddlewaves
    ));

    // read list
    this.get(pattern.root, compose(applyListMiddlewares));
    // read item
    this.get(pattern.item, compose(applyItemMiddlewares));

    return this;
  }

  /**
   * Update record
   * @param {Object|Function} middlewave
   * @param {Object} options
   * @return {Object}
   */
  update(middlewave, options) {
    const { collection, options: { id }, pattern } = this;
    this.methods.update = true;
    let updateMiddleware = null;
    if (isFunction(middlewave)) {
      updateMiddleware = middlewave;
    } else {
      updateMiddleware = async (ctx, next) => {
        const attributes = ctx.state.attributes || snake(ctx.request.body);
        ctx.state.resource = (
          await collection(ctx)
            .query(q => q.where({ [id]: ctx.params[id] }))
            .fetch({ required: true })
        ).first();
        if (ctx.state.resource) {
          const updatedResource = await ctx.state.resource.save(attributes, {
            method: 'update',
            patch: true
          });
          await next();
          ctx.body = envelope({
            code: 0,
            message: 'Success',
            result: updatedResource
          });
          ctx.status = 202;
        } else {
          ctx.body = envelope({
            code: 404,
            message: 'Not found'
          });
        }
      };
      options = middlewave;
    }

    const { beforeMiddlewaves, afterMiddlewaves } = options || {};
    const applyUpdateMiddlewares = compact([].concat(
      beforeMiddlewaves,
      updateMiddleware,
      afterMiddlewaves
    ));
    this.put(pattern.item, compose(applyUpdateMiddlewares));
    this.patch(pattern.item, compose(applyUpdateMiddlewares));

    return this;
  }

  /**
   * Remove a record
   * @param {Object|Function} middlewave
   * @param {Object} options
   * @return {Object}
   */
  destroy(middlewave, options) {
    const { collection, pattern, options: { id } } = this;
    this.methods.destroy = true;

    let deleteMiddlewave = null;
    if (isFunction(middlewave)) {
      deleteMiddlewave = middlewave;
    } else {
      deleteMiddlewave = async (ctx, next) => {
        ctx.state.resource = await collection(ctx)
          .query(q => q.where({ [id]: ctx.params[id] }))
          .fetchOne({ require: false });
        if (ctx.state.resource) {
          ctx.state.deleted = ctx.state.resource.toJSON();
          await ctx.state.resource.destroy();
          await next();
          ctx.body = envelope({
            code: 0,
            message: 'Success'
          });
          /* ctx.status = 204; */
        } else {
          ctx.body = envelope({
            code: 404,
            message: 'Not found'
          });
        }
      };
      options = middlewave;
    }

    const { beforeMiddlewaves, afterMiddlewaves } = options || {};
    const applyDeleteMiddlewares = compact([].concat(
      beforeMiddlewaves,
      deleteMiddlewave,
      afterMiddlewaves
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

  /**
   * Nest router
   */
  // children(...children) {
  //   const { pattern } = this;
  //   this.use(
  //     `${pattern}/:${this.foreignId}(${this.idType})`,
  //     async (ctx, next) => {
  //       ctx.state.nested = ctx.state.nested || {};
  //       ctx.state.nested[this.name] = await this.collection(ctx).query(q =>
  //         q.where({ [this.idAttribute]: ctx.params[this.foreignId] })
  //       ).fetchOne({ require: true });
  //       await next();
  //     },
  //     ...children.map( Child => Child instanceof Base
  //       ? Child.routes()
  //       : Child.prototype instanceof Base
  //         ? new Child().routes()
  //         : Child)
  //   )
  //   return this;
  // }
}
