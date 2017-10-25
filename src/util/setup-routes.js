import requireAll from 'require-all';
import { isFunction, isObject } from 'lodash';

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
    } else if (isObject(module)) {
      appendRoutes(app, module);
    }
  });
};

export default (app, dirname) => {
  appendRoutes(app, requireAll({
    dirname,
    recursive: true
  }));
};
