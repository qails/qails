import importFresh from 'import-fresh';
import { bookshelf } from '../../src';

const TABLE_NAME = 'uuid';

describe('plugin::uuid', () => {
  before(async () => {
    delete process.env.MODEL_UUID;
    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_NAME)
      .createTable(TABLE_NAME, (table) => {
        table.string('id', 36).default('').primary();
        table.string('name');
      });
  });

  after(async () => {
    delete process.env.MODEL_UUID;
    await bookshelf.knex.schema.dropTableIfExists(TABLE_NAME);
  });

  describe('禁用插件时', () => {
    const { Model } = importFresh('../../src/util/bookshelf');
    const Person = class extends Model {
      get tableName() { return TABLE_NAME; }
      get hasTimestamps() { return false; }
    };

    it('新增时不会插入id', async () => {
      await new Person().save({ name: 'Joe' });
      const model = await Person.findOne({ name: 'Joe' });
      model.get('id').should.be.exactly('');
    });
  });

  describe('启用插件时', () => {
    process.env.MODEL_UUID = 'true';
    const { Model } = importFresh('../../src/util/bookshelf');
    const Person = class extends Model {
      get tableName() { return TABLE_NAME; }
      get hasTimestamps() { return false; }
      get uuid() { return true; }
    };

    it('新增时自动插入id', async () => {
      const name = 'a';
      await new Person().save({ name });
      const model = await Person.findOne({ name });
      model.get('id').should.be.not.empty();
    });
    it('id长度为36', async () => {
      const name = 'b';
      await new Person().save({ name });
      const model = await Person.findOne({ name });
      model.get('id').length.should.eql(36);
    });
  });
});
