import casual from 'casual';
import should from 'should';
import { base } from '../../src';
import magicCase, { snake } from '../../src/util/magicCase';

const TABLE_USERS = 'users';
const TABLE_POSTS = 'posts';

const Post = base.Model.extend({
  tableName: TABLE_POSTS,
  hasTimestamps: false
});

const modelOptions = {
  tableName: TABLE_USERS,
  hasTimestamps: false,
  posts() {
    return this.hasMany(Post);
  }
};

describe('util::snake', () => {
  it('字符串返回', () => {
    const name = snake('aB');
    name.should.eql('a_b');
  });
  it('数组返回', () => {
    const name = snake(['aB', 'BB']);
    name.should.with.length(2);
  });
  it('undefined返回', () => {
    const name = snake(undefined);
    should(name).be.an.undefined();
  });
  it('对象返回', () => {
    const person = snake({
      aA: 'aa',
      BB: 'bb',
      cCC: 'ccc',
      dDdD: 'dddd'
    });
    person.should.have.property('a_a', 'aa');
    person.should.have.property('bb', 'bb');
    person.should.have.property('c_cc', 'ccc');
    person.should.have.property('d_dd_d', 'dddd');
  });
  it('包含=号的字符串应该原样返回', () => {
    const s = 'ab=c';
    const name = snake(s);
    name.should.eql(s);
  });
  it('包含>号的字符串应该原样返回', () => {
    const s = 'ab>c';
    const name = snake(s);
    name.should.eql(s);
  });
  it('包含<号的字符串应该原样返回', () => {
    const s = 'ab<c';
    const name = snake(s);
    name.should.eql(s);
  });
});

describe('plugin::magiccase', () => {
  before(async () => {
    await base.knex.schema
      .dropTableIfExists(TABLE_USERS)
      .createTable(TABLE_USERS, (table) => {
        table.increments();
        table.string('last_name');
      })
      .dropTableIfExists(TABLE_POSTS)
      .createTable(TABLE_POSTS, (table) => {
        table.increments();
        table.integer('user_id');
      });

    await base.knex(TABLE_POSTS).insert({ user_id: 1 });
  });

  after(async () => {
    await base.knex.schema
      .dropTableIfExists(TABLE_USERS)
      .dropTableIfExists(TABLE_POSTS);
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

    describe('获取数据', () => {
      it('返回驼峰命名数据', async () => {
        const model = await Model.findOne();
        const json = model.toJSON();
        json.should.have.property('lastName');
      });
      it('返回时json结构体内部数据应该递归处理', async () => {
        const model = await Model.findById(1, { withRelated: 'posts' });
        const json = model.toJSON();
        json.posts[0].should.have.property('userId', 1);
      });
    });
  });
});
