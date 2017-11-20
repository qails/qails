import { resolve } from 'path';
import { existsSync } from 'fs';
import { isFunction } from 'lodash';
import requireAll from 'require-all';

/**
 * 递归添加路由配置
 * @param {object} app
 * @param {object} modules
 */
const appendRoutes = (app, modules) => {
  Object.keys(modules).forEach((key) => {
    const module = modules[key];
    if (module.default && isFunction(module.default.routes)) {
      app.use(module.default.routes());
    } else {
      appendRoutes(app, module);
    }
  });
};

export default (app, dirname) => {
  const { DOCUMENT_ROOT = 'src' } = process.env;
  dirname = dirname || resolve(DOCUMENT_ROOT, 'routers');
  if (existsSync(dirname)) {
    appendRoutes(app, requireAll({
      dirname,
      filter: /(.+)\.js$/,
      recursive: true
    }));
  } else {
    throw new Error(`No such file or directory, scandir '${dirname}'\nSetup routers failed!`);
  }
};
