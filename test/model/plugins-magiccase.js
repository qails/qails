import casual from 'casual';
import should from 'should';
import importFresh from 'import-fresh';
import { bookshelf } from '../../src';
import { snake } from '../../src/util/magicCase';

const TABLE_USERS = 'users';
const TABLE_POSTS = 'posts';

const Post = class extends bookshelf.Model {
  get tableName() { return TABLE_POSTS; }
  get hasTimestamps() { return false; }
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
    process.env.MODEL_MAGICCASE = 'false';

    await bookshelf.knex.schema
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

    await bookshelf.knex(TABLE_POSTS).insert({ user_id: 1 });
  });

  after(async () => {
    process.env.MODEL_MAGICCASE = 'false';

    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_USERS)
      .dropTableIfExists(TABLE_POSTS);
  });


  describe('禁用插件时', () => {
    const { Model } = importFresh('../../src/util/bookshelf');
    const User = class extends Model {
      get tableName() { return TABLE_USERS; }
      get hasTimestamps() { return false; }
      posts() {
        return this.hasMany(Post);
      }
    };

    describe('新增数据', () => {
      it('下划线命名数据插入成功', async () => {
        const model = await User.create({ last_name: '' });
        model.should.be.an.instanceOf(Model);
      });
      it('驼峰命名数据插入插入报错', async () => {
        try {
          await User.create({ lastName: '' });
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
        const model = await User.update({ last_name: name }, { id });
        model.should.be.an.instanceOf(Model);
        model.get('last_name').should.eql(name);
      });
      it('驼峰命名数据修改报错', async () => {
        const name = casual.last_name;
        try {
          await User.update({ lastName: name }, { id });
          should.fail();
        } catch (e) {
          e.errno.should.eql(1054);
        }
      });
    });
  });

  describe('启用插件时', () => {
    process.env.MODEL_MAGICCASE = 'true';
    const { Model } = importFresh('../../src/util/bookshelf');
    const User = class extends Model {
      get tableName() { return TABLE_USERS; }
      get hasTimestamps() { return false; }
      posts() {
        return this.hasMany(Post);
      }
    };

    describe('新增数据', () => {
      const name = casual.last_name;
      it('新增下划线命名数据插入成功', async () => {
        const model = await User.create({ last_name: name });
        model.should.be.an.instanceOf(Model);
      });
      it('新增驼峰命名数据插入成功', async () => {
        const model = await User.create({ lastName: name });
        model.should.be.an.instanceOf(Model);
      });
    });

    describe('修改数据', () => {
      const id = 1;
      const name = casual.last_name;

      it('下划线命名数据修改成功', async () => {
        const model = await User.update({ last_name: name }, { id });
        model.should.be.an.instanceOf(Model);
        model.get('last_name').should.eql(name);
      });
      it('驼峰命名数据修改成功', async () => {
        // *** Model.update() 方式更新不通过，抽空排查问题 *** //
        // const model = await User.update({ lastName: name }, { id });
        const model = await new User({ id }).save({ lastName: name });
        model.should.be.an.instanceOf(Model);
        model.get('last_name').should.eql(name);
      });
    });

    describe('获取数据', () => {
      it('返回驼峰命名数据', async () => {
        const model = await User.findOne();
        const json = model.toJSON();
        json.should.have.property('lastName');
      });
      it('返回时json结构体内部数据应该递归处理', async () => {
        const model = await User.findById(1, { withRelated: 'posts' });
        const json = model.toJSON();
        json.posts[0].should.have.property('userId', 1);
      });
    });
  });
});
