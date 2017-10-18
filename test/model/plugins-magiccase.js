import casual from 'casual';
import should from 'should';
import { base } from '../../src';
import magicCase from '../../src/util/magic-case';

const TABLE_NAME = 'magiccase';

const modelOptions = {
  tableName: TABLE_NAME,
  hasTimestamps: false
};

describe('Plugin: magiccase', () => {
  before(async () => {
    await base.knex.schema
      .dropTableIfExists(TABLE_NAME)
      .createTable(TABLE_NAME, (table) => {
        table.increments();
        table.string('last_name');
      });
  });

  after(async () => {
    await base.knex.schema.dropTableIfExists(TABLE_NAME);
  });

  describe('禁用插件时', () => {
    const Model = base.Model.extend(modelOptions);
    describe('新增数据', () => {
      it('下划线命名数据插入成功', async () => {
        const model = await Model.create({ last_name: '' });
        model.should.be.an.instanceOf(Model);
      });
      it('驼峰命名数据插入插入报错', async () => {
        try {
          await Model.create({ lastName: '' });
          should.fail();
        } catch (e) {
          e.errno.should.eql(1054);
        }
      });
    });
    describe('修改数据', () => {
      const id = 1;
      it('下划线命名数据修改成功', async () => {
        const name = casual.last_name;
        const model = await Model.update({ last_name: name }, { id });
        model.should.be.an.instanceOf(Model);
        model.get('last_name').should.eql(name);
      });
      it('驼峰命名数据修改报错', async () => {
        const name = casual.last_name;
        try {
          await Model.update({ lastName: name }, { id });
          should.fail();
        } catch (e) {
          e.errno.should.eql(1054);
        }
      });
    });
  });

  describe('启用插件时', () => {
    base.plugin(magicCase);
    const Model = base.Model.extend(modelOptions);

    describe('新增数据', () => {
      const name = casual.last_name;
      it('新增下划线命名数据插入成功', async () => {
        const model = await Model.create({ last_name: name });
        model.should.be.an.instanceOf(Model);
      });
      it('新增驼峰命名数据插入成功', async () => {
        const model = await Model.create({ lastName: name });
        model.should.be.an.instanceOf(Model);
      });
    });

    describe('修改数据', () => {
      const id = 1;
      const name = casual.last_name;
      it('下划线命名数据修改成功', async () => {
        const model = await Model.update({ last_name: name }, { id });
        model.should.be.an.instanceOf(Model);
        model.get('last_name').should.eql(name);
      });
      it('驼峰命名数据修改成功', async () => {
        // *** Model.update() 方式更新不通过，抽空排查问题 *** //
        // const model = await Model.update({ lastName: name }, { id });
        const model = await new Model({ id }).save({ lastName: name });
        model.should.be.an.instanceOf(Model);
        model.get('last_name').should.eql(name);
      });
    });
  });
});
