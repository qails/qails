import { Model } from 'qails';
import Post from './post';

/**
 * @class User
 */
export default class User extends Model {
  /**
   * 依赖模型方法，在本模型底部有定义
   * 删除时依据此项删除关联表中对应的数据
   * @static {array}
   */
  static dependents = ['posts'];

  /**
   * @method 表名称
   * @return {string}
   */
  get tableName() {
    return 'users';
  }

  /**
   * 是否包含 created_at 和 updated_at
   * 默认包含
   * @member
   * @return {boolean|array}
   */
  get hasTimestamps() {
    return false;
  }

  /**
   * 1:n
   * @method
   * @return {bookshelf.Collection}
   */
  posts() {
    return this.hasMany(Post);
  }
}
