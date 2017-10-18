import { base } from '../../src';

const TABLE_NAME = 'pagination';

const modelOptions = {
  tableName: TABLE_NAME,
  hasTimestamps: false
};

describe('Plugin: pagination', () => {
  before(async () => {
    await base.knex.schema
      .dropTableIfExists(TABLE_NAME)
      .createTable(TABLE_NAME, (table) => {
        table.string('id');
      });

    const data = [];
    for (let i = 0; i < 25; i++) {
      data.push({ id: i + 1 });
    }

    await base.knex(TABLE_NAME).insert(data);
  });

  after(async () => {
    await base.knex.schema.dropTableIfExists(TABLE_NAME);
  });

  describe('启用插件时', () => {
    base.plugin('visibility');
    const Model = base.Model.extend(modelOptions);

    it('默认每次取回10条记录', async () => {
      const model = await Model.fetchPage();
      const { pagination } = model;
      pagination.should.have.property('page', 1);
      pagination.should.have.property('pageSize', 10);
      pagination.should.not.have.property('offset');
      pagination.should.not.have.property('limit');
      pagination.should.have.property('rowCount', 25);
      pagination.should.have.property('pageCount', 3);
    });

    it('每次取回4条记录', async () => {
      const model = await Model.fetchPage({ page: 2, pageSize: 4 });
      const { pagination } = model;
      pagination.should.have.property('page', 2);
      pagination.should.have.property('pageSize', 4);
      pagination.should.not.have.property('offset');
      pagination.should.not.have.property('limit');
      pagination.should.have.property('rowCount', 25);
      pagination.should.have.property('pageCount', 7);
    });

    it('使用offset和limit方式分页', async () => {
      const model = await Model.fetchPage({ limit: 4 });
      const { pagination } = model;
      pagination.should.not.have.property('page');
      pagination.should.not.have.property('pageSize');
      pagination.should.have.property('offset', 0);
      pagination.should.have.property('limit', 4);
      pagination.should.have.property('rowCount', 25);
      pagination.should.have.property('pageCount', 7);
    });
  });
});
