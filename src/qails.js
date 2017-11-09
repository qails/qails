import semver from 'semver';
import Koa from 'koa';
import qs from 'koa-qs';
import { name, version, engines } from '../package.json';

const checkNodeVersion = () => {
  const enginesNode = engines.node;
  const localNode = process.versions.node;

  if (!semver.satisfies(localNode, enginesNode)) {
    const error = `⚠️ ${name}@${version} requires node ${enginesNode} but ${localNode} was installed.`;
    console.log(error);
  }
};
checkNodeVersion();

export default class Qails {
  constructor(middlewares = []) {
    this.server = null;
    this.koa = qs(new Koa());
    middlewares = Array.isArray(middlewares) ? middlewares : [middlewares];
    // koa会对中间件做有效性检查，此处不重复检查
    middlewares.forEach(mw => this.use(mw));
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
