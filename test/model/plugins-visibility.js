import importFresh from 'import-fresh';
import { bookshelf } from '../../src';

const TABLE_NAME = 'visibility';

describe('plugin::visibility', () => {
  before(async () => {
    process.env.MODEL_VISIBILITY = 'false';
    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_NAME)
      .createTable(TABLE_NAME, (table) => {
        table.increments();
      });

    await bookshelf.knex(TABLE_NAME).insert({});
  });

  after(async () => {
    process.env.MODEL_VISIBILITY = 'false';
    await bookshelf.knex.schema.dropTableIfExists(TABLE_NAME);
  });

  describe('禁用插件时', () => {
    it('toJSON()返回id字段', async () => {
      const { Model } = importFresh('../../src/util/bookshelf');
      const Visibility = class extends Model {
        get tableName() { return TABLE_NAME; }
        get hasTimestamps() { return false; }
      };

      const model = await Visibility.findOne();
      const first = model.toJSON();
      first.should.have.property('id', 1);
    });
  });

  describe('启用插件时', () => {
    process.env.MODEL_VISIBILITY = 'true';
    const { Model } = importFresh('../../src/util/bookshelf');
    const Visibility = class extends Model {
      get hidden() { return ['id']; }
      get tableName() { return TABLE_NAME; }
      get hasTimestamps() { return false; }
    };

    it('toJSON()不返回id字段', async () => {
      const model = await Visibility.findOne();
      const first = model.toJSON();
      first.should.not.have.property('id');
    });
  });
});
