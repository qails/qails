import importFresh from 'import-fresh';
import { bookshelf } from '../../src';

const TABLE_NAME = 'mask';

describe('plugin::mask', () => {
  before(async () => {
    process.env.MODEL_MASK = 'false';
    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_NAME)
      .createTable(TABLE_NAME, (table) => {
        table.increments();
        table.string('name');
      });
    await bookshelf.knex(TABLE_NAME).insert({ name: 'Joe' });
  });

  after(async () => {
    process.env.MODEL_MASK = 'false';
    await bookshelf.knex.schema.dropTableIfExists(TABLE_NAME);
  });

  process.env.MODEL_MASK = 'true';
  const { Model } = importFresh('../../src/util/bookshelf');
  const Person = class extends Model {
    static masks = { custom: 'name' };
    get tableName() { return TABLE_NAME; }
    get hasTimestamps() { return false; }
  };

  it('使用模型中预设的字段应该不返回id字段', async () => {
    const model = await Person.findOne();
    const mask = model.mask('custom');
    mask.should.have.property('name');
    mask.should.not.have.property('id');
  });

  it('使用mask参数字段应该不返回id字段', async () => {
    const model = await Person.findOne();
    const mask = model.mask('name');
    mask.should.have.property('name');
    mask.should.not.have.property('id');
  });
});
