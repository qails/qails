import { Model } from '../../../../src';
import { model as Hotel } from '../hotel';

/**
 * @class Room
 */
export default class Room extends Model {
  /**
   * @method 表名称
   * @return {string}
   */
  get tableName() {
    return 'rooms';
  }

  /**
   * 是否包含 created_at 和 updated_at
   * 默认包含
   * @member
   * @return {boolean|array}
   */
  get hasTimestamps() {
    return ['createdAt', 'updatedAt'];
  }

  /**
   * One-to-one
   * @method
   * @return {bookshelf.Collection}
   */
  hotel() {
    return this.belongsTo(Hotel, 'hotelId');
  }
}
