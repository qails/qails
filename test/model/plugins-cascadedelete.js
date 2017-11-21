import should from 'should';
import importFresh from 'import-fresh';
import { bookshelf } from '../../src';

const TABLE_USERS = 'users';
const TABLE_POSTS = 'posts';
const TABLE_COMMENTS = 'comments';

describe('plugin::cascadedelete', () => {
  before(async () => {
    process.env.MODEL_CASCADEDELETE = 'false';

    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_USERS)
      .createTable(TABLE_USERS, (table) => {
        table.increments();
      })
      .dropTableIfExists(TABLE_POSTS)
      .createTable(TABLE_POSTS, (table) => {
        table.increments();
        table.integer('user_id');
      })
      .dropTableIfExists(TABLE_COMMENTS)
      .createTable(TABLE_COMMENTS, (table) => {
        table.increments();
        table.integer('post_id');
      });

    const userData = [1, 2, 3].map(item => ({ id: item }));
    const postData = [1, 2, 3].map(item => ({ id: item, user_id: item }));
    const commentData = [1, 2, 3].map(item => ({ id: item, post_id: item }));

    await bookshelf.knex(TABLE_USERS).insert(userData);
    await bookshelf.knex(TABLE_POSTS).insert(postData);
    await bookshelf.knex(TABLE_COMMENTS).insert(commentData);
  });

  after(async () => {
    process.env.MODEL_CASCADEDELETE = 'false';

    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_USERS)
      .dropTableIfExists(TABLE_POSTS)
      .dropTableIfExists(TABLE_COMMENTS);
  });

  describe('禁用插件时', () => {
    it('当模型被删除时，直接关联模型不会被删除', async () => {
      const { Model } = importFresh('../../src/util/bookshelf');
      const User = class extends Model {
        get tableName() { return TABLE_USERS; }
      };
      const Post = class extends Model {
        get tableName() { return TABLE_POSTS; }
      };
      const id = 1;
      await User.destroy({ id });
      const post = await Post.findOne({ user_id: id });
      post.should.be.an.instanceOf(Post);
    });
  });

  describe('启用插件时', () => {
    process.env.MODEL_CASCADEDELETE = 'true';
    const { Model } = importFresh('../../src/util/bookshelf');

    const Comment = class extends Model {
      get tableName() { return TABLE_COMMENTS; }
    };
    const Post = class extends Model {
      static dependents = ['comments'];
      get tableName() { return TABLE_POSTS; }
      comments() { return this.hasMany(Comment); }
    };
    const User = class extends Model {
      static dependents = ['posts'];
      get tableName() { return TABLE_USERS; }
      posts() { return this.hasMany(Post); }
    };

    it('当模型被删除时，直接关联模型也被删除', async () => {
      const id = 2;
      const postBeforeDelete = await Post.findOne({ user_id: id });
      postBeforeDelete.should.be.an.instanceOf(Post);
      await User.destroy({ id });
      try {
        await Post.findOne({ user_id: id });
        should.fail();
      } catch (e) {
        e.message.should.equal('EmptyResponse');
      }
    });

    it('当模型被删除时，间接关联模型也被删除', async () => {
      const id = 3;
      const postBeforeDelete = await Post.findOne({ user_id: id });
      const commentsBeforeDelete = await Comment.findOne({ post_id: postBeforeDelete.get('id') });
      postBeforeDelete.should.be.an.instanceOf(Post);
      commentsBeforeDelete.should.be.an.instanceOf(Comment);
      await User.destroy({ id });
      try {
        await Post.findOne({ user_id: id });
        should.fail();
      } catch (e) {
        e.message.should.equal('EmptyResponse');
      }
      try {
        await Comment.findOne({ post_id: postBeforeDelete.get('id') });
        should.fail();
      } catch (e) {
        e.message.should.equal('EmptyResponse');
      }
    });
  });
});
