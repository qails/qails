import Koa from 'koa';
import qs from 'koa-qs';
import checkurlRouter from './middlewares/checkurl';

export default class Qails {
  constructor(middlewares = []) {
    this.server = null;
    this.koa = qs(new Koa());
    middlewares = Array.isArray(middlewares) ? middlewares : [middlewares];
    // koa会对中间件做有效性检查，此处不重复检查
    middlewares.forEach(mw => this.use(mw));

    // 为 Jenkis 发布系统创建 checkurl 路由
    this.use(checkurlRouter.routes());
  }

  use(...args) {
    this.koa.use(...args);
    return this;
  }

  listen(port, cb) {
    this.server = this.koa.listen(port, cb);
    return this.server;
  }
}
