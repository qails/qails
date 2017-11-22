import { Model } from 'qails';

/**
 * @class Post
 */
export default class Post extends Model {
  /**
   * @method 表名称
   * @return {string}
   */
  get tableName() {
    return 'posts';
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
}
