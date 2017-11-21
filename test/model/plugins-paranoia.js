import importFresh from 'import-fresh';
import should from 'should';
import { bookshelf } from '../../src';

const TABLE_USERS = 'users';
const TABLE_POSTS = 'posts';
const TABLE_COMMENTS = 'comments';

const id = 1;

describe('plugin::paranoia', () => {
  before(async () => {
    delete process.env.MODEL_CASCADEDELETE;
    delete process.env.MODEL_SOFTDELETE;

    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_USERS)
      .createTable(TABLE_USERS, (table) => {
        table.increments();
        table.timestamps();
        table.timestamp('deleted_at').nullable();
      })
      .dropTableIfExists(TABLE_POSTS)
      .createTable(TABLE_POSTS, (table) => {
        table.increments();
        table.integer('user_id');
        table.timestamps();
        table.timestamp('deleted_at').nullable();
      })
      .dropTableIfExists(TABLE_COMMENTS)
      .createTable(TABLE_COMMENTS, (table) => {
        table.increments();
        table.integer('post_id');
        table.timestamps();
        table.timestamp('deleted_at').nullable();
      });
  });

  beforeEach(async () => {
    await bookshelf.knex(TABLE_USERS).insert({ id });
    await bookshelf.knex(TABLE_POSTS).insert({ id, user_id: id });
    await bookshelf.knex(TABLE_COMMENTS).insert({ id, post_id: id });
  });

  afterEach(async () => {
    await bookshelf.knex(TABLE_USERS).del();
    await bookshelf.knex(TABLE_POSTS).del();
    await bookshelf.knex(TABLE_COMMENTS).del();
  });

  after(async () => {
    delete process.env.MODEL_CASCADEDELETE;
    delete process.env.MODEL_SOFTDELETE;

    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_USERS)
      .dropTableIfExists(TABLE_POSTS)
      .dropTableIfExists(TABLE_COMMENTS);
  });

  describe('单独使用时', () => {
    process.env.MODEL_SOFTDELETE = 'true';
    const { Model } = importFresh('../../src/util/bookshelf');

    const User = Model.extend({
      tableName: TABLE_USERS,
      softDelete: true
    });

    it('当模型被软删除后，记录通过ORM模型找不到', async () => {
      const userBeforeDelete = await User.findOne({ id });
      userBeforeDelete.should.be.an.instanceOf(User);
      should(userBeforeDelete.get('deleted_at')).be.null();
      await new User({ id }).destroy();
      try {
        await User.findOne({ id });
        should.fail();
      } catch (e) {
        e.message.should.equal('EmptyResponse');
      }
    });

    it('当模型被软删除后，记录通过SQL能找到', async () => {
      await new User({ id }).destroy();
      const collection = await bookshelf.knex(TABLE_USERS).select('*').where('id', id);
      collection.should.with.lengthOf(1);
      const user = collection[0];
      user.should.have.property('deleted_at');
      user.deleted_at.should.not.be.null();
    });
  });

  describe('和cascadedelete一起使用时', () => {
    process.env.MODEL_CASCADEDELETE = 'true';
    const { Model } = importFresh('../../src/util/bookshelf');

    const Comment = class extends Model {
      get tableName() { return TABLE_COMMENTS; }
      get softDelete() { return true; }
    };
    const Post = class extends Model {
      static dependents = ['comments'];
      get tableName() { return TABLE_POSTS; }
      get softDelete() { return true; }
      comments() {
        return this.hasMany(Comment);
      }
    };
    const User = class extends Model {
      static dependents = ['posts'];
      get tableName() { return TABLE_USERS; }
      get softDelete() { return true; }
      posts() {
        return this.hasMany(Post);
      }
    };

    it('当模型被软删除后，通过ORM找不到它的直接关联模型', async () => {
      await new User({ id }).destroy();
      try {
        await Post.findOne({ user_id: id });
        should.fail();
      } catch (e) {
        e.message.should.equal('EmptyResponse');
      }
    });

    it('当模型被软删除后，通过SQL能找到它的直接关联模型', async () => {
      await new User({ id }).destroy();
      const collection = await bookshelf.knex(TABLE_POSTS).select('*').where('user_id', id);
      collection.should.with.lengthOf(1);
      const post = collection[0];
      post.should.have.property('deleted_at');
      post.deleted_at.should.not.be.null();
    });

    it('当模型被软删除后，通过ORM找不到它的间接关联模型', async () => {
      await new User({ id }).destroy();
      try {
        await Comment.findOne({ post_id: id });
        should.fail();
      } catch (e) {
        e.message.should.equal('EmptyResponse');
      }
    });

    it('当模型被软删除后，通过SQL能找到它的间接关联模型', async () => {
      await new User({ id }).destroy();
      const collection = await bookshelf.knex(TABLE_COMMENTS).select('*').where('post_id', id);
      collection.should.with.lengthOf(1);
      const comment = collection[0];
      comment.should.have.property('deleted_at');
      comment.deleted_at.should.not.be.null();
    });
  });
});
