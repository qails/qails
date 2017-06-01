import { Model } from '../..';

/**
 * @class Config
 */
export default class Config extends Model {
  /**
   * @method 表名称
   * @return {string}
   */
  get tableName() {
    return 'configs';
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
