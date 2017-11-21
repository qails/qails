import should from 'should';
import importFresh from 'import-fresh';
import { bookshelf } from '../../src';

const TABLE_NAME = 'users';

describe('plugin::jsoncolumns', () => {
  before(async () => {
    process.env.MODEL_JSONCOLUMNS = 'false';
    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_NAME)
      .createTable(TABLE_NAME, (table) => {
        table.increments();
        table.string('geojson');
      });
  });

  afterEach(async () => {
    await bookshelf.knex(TABLE_NAME).del();
  });

  after(async () => {
    process.env.MODEL_JSONCOLUMNS = 'false';
    await bookshelf.knex.schema.dropTableIfExists(TABLE_NAME);
  });

  describe('禁用插件时', () => {
    const { Model } = importFresh('../../src/util/bookshelf');
    const User = class extends Model {
      get tableName() { return TABLE_NAME; }
      get hasTimestamps() { return false; }
    };

    it('新增时插入一个json对象会报错', async () => {
      try {
        await new User().save({ geojson: { name: 'Joe' } });
        should.fail();
      } catch (e) {
        e.should.have.property('errno', 1054);
      }
    });

    it('修改时插入一个json对象会报错', async () => {
      await new User().save({ geojson: 'test' });
      try {
        await new User({ id: 1 }).save({ geojson: { name: 'Joe' } });
        should.fail();
      } catch (e) {
        e.should.have.property('errno', 1054);
      }
    });
  });

  describe('启用插件时', () => {
    process.env.MODEL_JSONCOLUMNS = 'true';
    const { Model } = importFresh('../../src/util/bookshelf');

    const User = class extends Model {
      static jsonColumns = ['geojson'];
      get tableName() { return TABLE_NAME; }
      get hasTimestamps() { return false; }
    };

    it('新增时插入一个json对象会正常保存，获取时返回json对象', async () => {
      const name = 'Joe';
      const geojson = { name };
      const model = await new User().save({ geojson });
      model.should.be.an.instanceOf(Model);
      model.get('geojson').should.have.property('name', name);
      model.toJSON().geojson.should.have.property('name', name);
    });

    it('新增时插入一个字符串会正常保存，获取时返回字符串', async () => {
      const name = 'Joe';
      const geojson = name;
      const model = await new User().save({ geojson });
      model.should.be.an.instanceOf(Model);
      model.get('geojson').should.eql(name);
      model.toJSON().geojson.should.eql(name);
    });

    it('新增时插入undefined会正常保存，获取时返回undefined', async () => {
      const geojson = undefined;
      const model = await new User().save({ geojson });
      model.should.be.an.instanceOf(Model);
      should(model.get('geojson')).be.an.undefined();
    });

    it('新增时插入null会正常保存，获取时返回null', async () => {
      const geojson = null;
      const model = await new User().save({ geojson });
      model.should.be.an.instanceOf(Model);
      should(model.get('geojson')).be.an.null();
    });

    it('修改时插入一个json对象会正常保存，获取时返回json对象', async () => {
      const name = 'Joe';
      const newName = 'new name';
      const geojson = { name };
      await new User().save({ geojson });
      let model = await User.findOne();
      model = await model.save({ geojson: { name: newName } });
      model.should.be.an.instanceOf(Model);
      model.get('geojson').should.have.property('name', newName);
      model.toJSON().geojson.should.have.property('name', newName);
    });
  });
});
