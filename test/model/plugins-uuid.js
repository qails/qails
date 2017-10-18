import uuid from 'bookshelf-uuid';
// import { dropTable, recreateTable } from '../utils';
import { base } from '../../src';

const TABLE_NAME = 'uuid';

const modelOptionsDisablePlugin = {
  tableName: TABLE_NAME,
  hasTimestamps: false
};

const modelOptionsEnablePlugin = {
  uuid: true,
  ...modelOptionsDisablePlugin
};

describe('Plugin: uuid', () => {
  before(async () => {
    await base.knex.schema
      .dropTableIfExists(TABLE_NAME)
      .createTable(TABLE_NAME, (table) => {
        table.string('id', 36).default('').primary();
        table.string('name');
      });
  });

  after(async () => {
    await base.knex.schema.dropTableIfExists(TABLE_NAME);
  });

  describe('禁用插件时', () => {
    const Model = base.Model.extend(modelOptionsDisablePlugin);

    it('新增时不会插入id', async () => {
      await new Model().save({ name: 'Joe' });
      const model = await Model.findOne({ name: 'Joe' });
      model.get('id').should.be.exactly('');
    });
  });

  describe('启用插件时', () => {
    base.plugin(uuid);

    it('新增时自动插入id', async () => {
      const Model = base.Model.extend(modelOptionsEnablePlugin);
      const name = 'a';
      await new Model().save({ name });
      const model = await Model.findOne({ name });
      model.get('id').should.be.not.empty();
    });
    it('id长度为36', async () => {
      const Model = base.Model.extend(modelOptionsEnablePlugin);
      const name = 'b';
      await new Model().save({ name });
      const model = await Model.findOne({ name });
      model.get('id').length.should.eql(36);
    });
  });
});
