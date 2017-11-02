import {
  camelCase,
  snakeCase,
  isObject,
  isString,
  isArray
} from 'lodash';

function snakeCaseExcludeOperator(s) {
  // 忽略包含比较符的字符串
  // 可能会出现['id','=','100']这种数据
  if (/[<>=]/.test(s)) {
    return s;
  }
  return snakeCase(s);
}

/**
 * 将 object-key 转为大写
 * @param {object|array|string} attributes
 * @param {array} excludeKeys
 * @return {object}
 */
function toCamelCase(attributes, excludeKeys = []) {
  const source = attributes;
  Object.keys(source).forEach((attribute) => {
    const newAttribute = camelCase(attribute);
    // json串内部的对象不做处理
    if (isObject(source[attribute]) && excludeKeys.indexOf(attribute) === -1) {
      source[newAttribute] = toCamelCase(source[attribute], excludeKeys);
    } else {
      source[newAttribute] = source[attribute];
    }
    if (newAttribute !== attribute) {
      delete source[attribute];
    }
  });
  return source;
}

/**
 * 暴露给外部单独使用的方法
 * @param {object} source
 * @return {object}
 */
export const snake = (source) => {
  if (isString(source)) {
    return snakeCaseExcludeOperator(source);
  } else if (isArray(source)) {
    return source.map(item => snakeCaseExcludeOperator(item));
  } else if (isObject(source)) {
    const dest = {};
    Object.keys(source).forEach((item) => {
      dest[snakeCaseExcludeOperator(item)] = source[item];
    });
    return dest;
  }
  return source;
};

export default (Bookshelf) => {
  const proto = Bookshelf.Model.prototype;

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize(...args) {
      this.magicCase = true;
      // 下面代码对 new Model().save({mapId}) 方式新增记录生效
      this.on('saving', () => {
        const source = this.attributes;
        Object.keys(source).forEach((attribute) => {
          const newAttribute = snakeCaseExcludeOperator(attribute);
          if (newAttribute !== attribute) {
            source[newAttribute] = source[attribute];
            delete source[attribute];
          }
        });
        this.attributes = source;
      });

      return proto.initialize.apply(this, args);
    },

    // eslint-disable-next-line
    toJSON: function(options) {
      const attrs = proto.toJSON.call(this, options);
      return toCamelCase(attrs, this.constructor.jsonColumns);
    }
  });
};
