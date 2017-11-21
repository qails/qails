import casual from 'casual';
import should from 'should';
import Joi from 'joi';
import { bookshelf } from '../../src';

const TABLE_NAME = 'modelbase';

const modelOptions = {
  tableName: TABLE_NAME
};

describe('plugin::modelbase', () => {
  before(async () => {
    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_NAME)
      .createTable(TABLE_NAME, (table) => {
        table.increments();
        table.string('name');
        table.timestamps();
      });
  });

  after(async () => {
    await bookshelf.knex.schema.dropTableIfExists(TABLE_NAME);
  });

  describe('timestamps', () => {
    it('新增时自动插入created_at', async () => {
      const Model = bookshelf.Model.extend(modelOptions);
      const model = await new Model().save({ name: casual.name });
      should(model.get('created_at')).be.not.undefined();
    });
  });

  describe('validateSave', () => {
    const validateOptions = { ...modelOptions, validate: { name: Joi.string() } };
    let modelId;
    describe('新增', () => {
      it('通过校验时模型应该被存储', async () => {
        const name = casual.name;
        const Model = bookshelf.Model.extend(validateOptions);
        const model = await Model.create({ name });
        modelId = model.get('id');
        model.should.be.an.instanceof(Model);
        model.get('name').should.eql(name);
      });

      it('校验失败时应该报错', async () => {
        const name = 100;
        const Model = bookshelf.Model.extend(validateOptions);
        try {
          await Model.create({ name });
          should.fail();
        } catch (e) {
          e.name.should.equal('ValidationError');
        }
      });
    });

    describe('修改', () => {
      it('通过校验时模型应该被存储', async () => {
        const name = casual.name;
        const Model = bookshelf.Model.extend(validateOptions);
        const model = await Model.update({ name }, { id: modelId });
        model.should.be.an.instanceof(Model);
        model.get('name').should.eql(name);
      });

      it('校验失败时应该报错', async () => {
        const name = 100;
        const Model = bookshelf.Model.extend(validateOptions);
        try {
          await Model.update({ name }, { id: modelId });
          should.fail();
        } catch (e) {
          e.name.should.equal('ValidationError');
        }
      });
    });
  });

  describe('create()', () => {
    it('应该创建一个新模型', async () => {
      const name = casual.name;
      const Model = bookshelf.Model.extend(modelOptions);
      const model = await Model.create({ name });
      model.get('name').should.eql(name);
    });
  });

  describe('destroy()', () => {
    it('应该删除选中的模型', async () => {
      const name = casual.name;
      const Model = bookshelf.Model.extend(modelOptions);
      const model = await Model.create({ name });
      const id = model.get('id');
      await Model.destroy({ id });
      try {
        await Model.findById(id);
        should.fail();
      } catch (e) {
        e.message.should.equal('EmptyResponse');
        e.constructor.prototype.should.have.property('name', 'CustomError');
        // should.be.an.instanceOf(Object).and.have.property("name", "tj");
      }
    });
  });

  describe('findAll()', () => {
    it('能返回所有记录', async () => {
      const Model = bookshelf.Model.extend(modelOptions);
      const count = await Model.count();
      await Model.findAll()
        .then(collection => collection.size())
        .then(size => size.should.eql(count));
    });
  });

  describe('findById()', () => {
    it('应该通过id返回一个模型', async () => {
      const Model = bookshelf.Model.extend(modelOptions);
      const create = await Model.create({ name: 'findById' });
      const model = await Model.findById(create.id);
      model.should.have.property('id', create.id);
    });
  });

  describe('findOne()', () => {
    it('应该返回一个模型', async () => {
      const Model = bookshelf.Model.extend(modelOptions);
      const model = await Model.findOne();
      model.should.be.an.instanceof(Model);
    });
  });

  describe('findOrCreate()', async () => {
    const name = casual.name;
    const Model = bookshelf.Model.extend(modelOptions);
    it('不存在的记录执行新增操作', async () => {
      const countBeforeInsert = await Model.count();
      await Model.findOrCreate({ name });
      const countAfterInsert = await Model.count();
      countAfterInsert.should.eql(countBeforeInsert + 1);
    });
    it('已存在的记录执行查询操作', async () => {
      const countBeforeInsert = await Model.count();
      await Model.findOrCreate({ name });
      const countAfterInsert = await Model.count();
      countAfterInsert.should.eql(countBeforeInsert);
    });
  });

  describe('update()', () => {
    it('应该返回一个修改后的模型', async () => {
      const name = casual.name;
      const Model = bookshelf.Model.extend(modelOptions);
      const model = await Model.findOne();
      const id = model.get('id');
      model.get('name').should.not.eql(name);
      const update = await Model.update({ name }, { id });
      update.should.be.an.instanceof(Model);
      update.get('name').should.eql(name);
    });

    it('当设置了require:false并且找不到记录时，应该返回undefined', async () => {
      const name = casual.name;
      const id = -1;
      const Model = bookshelf.Model.extend(modelOptions);
      const model = await Model.update({ name }, { id, require: false });
      should(model).be.an.undefined();
    });
  });

  describe('upsert()', () => {
    it('应该更新一个已经存在的模型', async () => {
      const name = casual.name;
      const newName = casual.name;
      name.should.not.eql(newName);
      const Model = bookshelf.Model.extend(modelOptions);
      const model = await Model.create({ name });
      const id = model.get('id');
      const upsert = await Model.upsert({ id }, { name: newName });
      upsert.get('id').should.eql(id);
      upsert.get('name').should.eql(newName);
    });

    it('应该新增一个不存在的模型', async () => {
      const name = casual.name;
      const id = 100;
      const Model = bookshelf.Model.extend(modelOptions);
      try {
        await Model.findById(id);
        should.fail();
      } catch (e) {
        e.message.should.equal('EmptyResponse');
      }
      const model = await Model.upsert({ id }, { name });
      model.get('name').should.eql(name);
    });
  });
});
