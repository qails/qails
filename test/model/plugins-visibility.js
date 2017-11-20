import { base } from '../../src';

const TABLE_NAME = 'visibility';

const modelOptionsDisablePlugin = {
  tableName: TABLE_NAME,
  hasTimestamps: false
};

const modelOptionsEnablePlugin = {
  hidden: ['id'],
  ...modelOptionsDisablePlugin
};

describe('plugin::visibility', () => {
  before(async () => {
    await base.knex.schema
      .dropTableIfExists(TABLE_NAME)
      .createTable(TABLE_NAME, (table) => {
        table.increments();
      });

    await base.knex(TABLE_NAME).insert({});
  });

  after(async () => {
    await base.knex.schema.dropTableIfExists(TABLE_NAME);
  });

  describe('禁用插件时', () => {
    it('toJSON()返回id字段', async () => {
      const Model = base.Model.extend(modelOptionsDisablePlugin);
      const model = await Model.findOne();
      const first = model.toJSON();
      first.should.have.property('id', 1);
    });
  });

  describe('启用插件时', () => {
    base.plugin('visibility');

    it('toJSON()不返回id字段', async () => {
      const Model = base.Model.extend(modelOptionsEnablePlugin);
      const model = await Model.findOne();
      const first = model.toJSON();
      first.should.not.have.property('id');
    });
  });
});
