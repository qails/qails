/**
 * 本文件因编写周期跨度较长，分别使用了 async/await 和 promise 两种编码风格
 * 有空时可以统一使用 async/await 方式重写
 */

/* eslint global-require: 0 */
import should from 'should';
import request from 'supertest';
import mask from 'bookshelf-mask';
import { range, first, last, repeat } from 'lodash';
import { bookshelf, Qails, Resource, bodyParserMiddleware } from '../../src';
import magicCase from '../../src/util/magicCase';

describe('util::resource', () => {
  const ROW_COUNT = 15;
  const TABLE_BOOKS = 'books';
  const TABLE_CHAPTERS = 'chapters';

  bookshelf.plugin(mask);
  bookshelf.plugin(magicCase);

  const Chapter = class extends bookshelf.Model {
    get tableName() { return TABLE_CHAPTERS; }
    get hasTimestamps() { return false; }
  };

  const Book = class extends bookshelf.Model {
    get tableName() { return TABLE_BOOKS; }
    get hasTimestamps() { return false; }
    chapters() {
      return this.hasMany(Chapter);
    }
  };

  before(async () => {
    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_BOOKS)
      .createTable(TABLE_BOOKS, (table) => {
        table.increments();
        table.string('name', 20);
      })
      .dropTableIfExists(TABLE_CHAPTERS)
      .createTable(TABLE_CHAPTERS, (table) => {
        table.integer('book_id');
      });

    await bookshelf.knex(TABLE_CHAPTERS)
      .insert(range(1, ROW_COUNT + 1).map(item => ({ book_id: item })));
  });

  beforeEach(async () => {
    await bookshelf.knex(TABLE_BOOKS).insert(range(1, ROW_COUNT + 1).map(item => ({ id: item })));
  });

  afterEach(async () => {
    await bookshelf.knex(TABLE_BOOKS).del();
  });

  after(async () => {
    await bookshelf.knex.schema
      .dropTableIfExists(TABLE_BOOKS)
      .dropTableIfExists(TABLE_CHAPTERS);
  });

  describe('Resource.define()', () => {
    const app = new Qails(bodyParserMiddleware());
    app.use(Resource.define(Book).routes());

    describe('查询', () => {
      describe('查询列表', () => {
        describe('无查询条件', () => {
          it('应该返回所有记录', (done) => {
            request(app.listen())
              .get('/books')
              .end((err, res) => {
                const { body } = res;
                should(body).be.not.undefined();
                body.should.have.length(ROW_COUNT);
                return done();
              });
          });
        });
        describe('有查询条件', () => {
          describe('where', () => {
            it('where[id]=2', (done) => {
              const id = 2;
              request(app.listen())
                .get(`/books?where[id]=${id}`)
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body } = res;
                  should(body).be.not.undefined();
                  first(body).should.have.property('id', id);
                  return done();
                });
            });
            it('where=id&where==&where=2', (done) => {
              const id = 2;
              request(app.listen())
                .get(`/books?where=id&where==&where=${id}`)
                .expect(200, (err, res) => {
                  const { body } = res;
                  should(body).be.not.undefined();
                  first(body).should.have.property('id', id);
                  return done();
                });
            });
            it('where=id,=,2', (done) => {
              const id = 2;
              request(app.listen())
                .get(`/books?where=id,=,${id}`)
                .expect(200, (err, res) => {
                  const { body } = res;
                  should(body).be.not.undefined();
                  first(body).should.have.property('id', id);
                  return done();
                });
            });
            it('长度对3取模后余数不足三的数组类型参数应该无效', async () => {
              const { body } = await request(app.listen()).get('/books?where=id&where==');
              body.should.have.length(ROW_COUNT);
            });
            it('无效的where条件应该返回所有记录', async () => {
              const { body } = await request(app.listen()).get('/books?where=id');
              body.should.have.length(ROW_COUNT);
            });
            it('无记录返回', async () => {
              const id = -1;
              const { body } = await request(app.listen()).get(`/books?where[id]=${id}`);
              body.should.have.property('message', 'EmptyResponse');
            });
          });
          describe('andWhere', () => {
            it('应该支持字符串类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&andWhere=id,=,3')
                .expect(200, (err, res) => {
                  const { body } = res;
                  body.should.have.property('message', 'EmptyResponse');
                  return done();
                });
            });
            it('应该支持对象类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&andWhere[id]=3')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body } = res;
                  body.should.have.property('message', 'EmptyResponse');
                  return done();
                });
            });
            it('应该支持数组类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&andWhere=id&andWhere==&andWhere=3')
                .expect(200, (err, res) => {
                  const { body } = res;
                  body.should.have.property('message', 'EmptyResponse');
                  return done();
                });
            });
            it('不完整的数组类型参数应该无效', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&andWhere=id')
                .expect(200, (err, res) => {
                  const { body } = res;
                  body.should.have.length(1);
                  first(body).should.have.property('id', 2);
                  return done();
                });
            });
            it('长度对3取模后余数不足三的数组类型参数应该无效', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&andWhere=id&andWhere==&andWhere=3&andWhere=id')
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  should(data).be.undefined();
                  return done();
                });
            });
          });
          describe('orWhere', () => {
            it('应该支持字符串类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&orWhere=id,=,3')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body } = res;
                  body.should.have.length(2);
                  first(body).should.have.property('id', 2);
                  last(body).should.have.property('id', 3);
                  return done();
                });
            });
            it('应该支持对象类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&orWhere[id]=3')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body } = res;
                  body.should.have.length(2);
                  first(body).should.have.property('id', 2);
                  last(body).should.have.property('id', 3);
                  return done();
                });
            });
            it('应该支持数组类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&orWhere=id&orWhere==&orWhere=3')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body } = res;
                  body.should.have.length(2);
                  first(body).should.have.property('id', 2);
                  last(body).should.have.property('id', 3);
                  return done();
                });
            });
            it('不完整的数组类型参数应该无效', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&orWhere=id')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body } = res;
                  body.should.have.length(1);
                  first(body).should.have.property('id', 2);
                  return done();
                });
            });
            it('长度对3取模后余数不足三的数组类型参数应该无效', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&orWhere=id&orWhere==')
                .expect(200, (err, res) => {
                  const { body } = res;
                  body.should.have.length(1);
                  first(body).should.have.property('id', 2);
                  return done();
                });
            });
          });
          describe('mask', () => {
            it('字段存在', (done) => {
              const showColumn = 'name';
              request(app.listen())
                .get(`/books?mask=${showColumn}`)
                .end((err, res) => {
                  const { body } = res;
                  first(body).should.not.have.property('id');
                  first(body).should.have.property(showColumn);
                  return done();
                });
            });
            it('字段不存在', (done) => {
              const showColumn = 'notexist';
              request(app.listen())
                .get(`/books?mask=${showColumn}`)
                .end((err, res) => {
                  const { body } = res;
                  first(body).should.not.have.property(showColumn);
                  return done();
                });
            });
          });
          describe('sort', () => {
            it('正向排序', (done) => {
              const column = 'id';
              request(app.listen())
                .get(`/books?sort=${column}`)
                .end((err, res) => {
                  const { body } = res;
                  first(body).should.have.property('id', 1);
                  return done();
                });
            });
            it('反向排序', (done) => {
              const column = '-id';
              request(app.listen())
                .get(`/books?sort=${column}`)
                .end((err, res) => {
                  const { body } = res;
                  first(body).should.have.property('id', 15);
                  return done();
                });
            });
          });
          describe('embed', () => {
            it('withRelated存在', (done) => {
              request(app.listen())
                .get('/books?withRelated=chapters')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body } = res;
                  should(body).be.not.undefined();
                  body.should.have.length(ROW_COUNT);
                  first(body).should.have.property('chapters');
                  return done();
                });
            });
            it('embed存在', (done) => {
              request(app.listen())
                .get('/books?embed=chapters')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body } = res;
                  should(body).be.not.undefined();
                  body.should.have.length(ROW_COUNT);
                  first(body).should.have.property('chapters');
                  return done();
                });
            });
            it('withRelated不存在应该返回空对象', (done) => {
              const embed = 'xxx';
              request(app.listen())
                .get(`/books?embed=${embed}`)
                .end((err, res) => {
                  const { body } = res;
                  body.should.be.empty();
                  return done();
                });
            });
          });
          describe('分页', () => {
            it('获取默认分页记录', (done) => {
              request(app.listen())
                .get('/books?page=1')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  if (err) {
                    return done(err);
                  }
                  const { body: { pagination, nodes } } = res;
                  pagination.should.have.property('page', 1);
                  pagination.should.have.property('pageSize', 10);
                  pagination.should.have.property('rowCount', ROW_COUNT);
                  pagination.should.have.property('pageCount', 2);
                  nodes.should.have.length(10);
                  return done();
                });
            });

            it('获取自定义分页记录', (done) => {
              const page = 3;
              const pageSize = 2;
              const pageCount = Math.round(ROW_COUNT / pageSize);

              request(app.listen())
                .get(`/books?page=${page}&pageSize=${pageSize}`)
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  if (err) {
                    return done(err);
                  }
                  const { body: { pagination, nodes } } = res;
                  pagination.should.have.property('page', page);
                  pagination.should.have.property('pageSize', pageSize);
                  pagination.should.have.property('rowCount', ROW_COUNT);
                  pagination.should.have.property('pageCount', pageCount);
                  nodes.should.have.length(pageSize);
                  first(nodes).should.have.property('id', ((page - 1) * pageSize) + 1);
                  return done();
                });
            });

            it('获取分页记录(mask)', (done) => {
              const showColumn = 'name';
              request(app.listen())
                .get(`/books?offset=0&mask=${showColumn}&sort=${showColumn}`)
                .end((err, res) => {
                  const { body: { nodes } } = res;
                  first(nodes).should.not.have.property('id');
                  first(nodes).should.have.property(showColumn);
                  return done();
                });
            });
            it('withRelated不存在时应该返回空对象', (done) => {
              const embed = 'xxx';
              request(app.listen())
                .get(`/books?offset=0&embed=${embed}`)
                .end((err, res) => {
                  const { body } = res;
                  body.should.be.empty();
                  return done();
                });
            });
          });
        });
      });
      describe('查询详情', () => {
        it('应该返回一条存在的记录', (done) => {
          const id = 1;
          request(app.listen())
            .get(`/books/${id}?embed=chapters`)
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
              const { body } = res;
              should(body).be.not.undefined();
              body.should.have.property('id', id);
              body.should.have.property('chapters');
              return done();
            });
        });

        it('获取一条存在的记录(withRelated)', (done) => {
          const id = 1;
          request(app.listen())
            .get(`/books/${id}?withRelated=chapters`)
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
              const { body } = res;
              should(body).be.not.undefined();
              body.should.have.property('id', id);
              body.should.have.property('chapters');
              return done();
            });
        });

        it('mask', (done) => {
          const showColumn = 'name';
          const id = 1;
          request(app.listen())
            .get(`/books/${id}?mask=${showColumn}`)
            .end((err, res) => {
              const { body } = res;
              body.should.not.have.property('id');
              body.should.have.property(showColumn);
              return done();
            });
        });

        it('获取一条不存在的记录', async () => {
          const id = 100;
          const { body: { message } } = await request(app.listen()).get(`/books/${id}`);
          message.should.eql('EmptyResponse');
        });
      });
    });

    describe('新增', () => {
      it('应该新增记录成功', async () => {
        const id = ROW_COUNT + 1;
        const test = request(app.listen());
        await test.post('/books').send({ id });
        const { body } = await test.get(`/books/${id}`);
        should(body).be.not.empty();
        body.should.have.property('id', id);
      });

      it('提交一个不存在的字段新增记录应该失败', async () => {
        const id = ROW_COUNT + 1;
        const test = request(app.listen());
        const xxx = 'xxx';
        const { body: { code } } = await test.post('/books').send({ id, xxx });
        should(code).eql('ER_BAD_FIELD_ERROR');
      });
    });

    describe('修改', () => {
      it('修改存在的记录应该返回修改后的记录', async () => {
        const id = 2;
        const name = 'name';
        const test = request(app.listen());
        await test.put(`/books/${id}`).send({ name });
        const { body } = await test.get(`/books/${id}`);
        should(body).be.not.undefined();
        body.should.have.property('name', name);
      });

      it('传入不存在的字段时应该修改失败', async () => {
        const id = 2;
        const name = 'name';
        const test = request(app.listen());
        await test.put(`/books/${id}`).send({ name, xxx: 'xxx' });
        const { body } = await test.get(`/books/${id}`);
        should(body).be.not.undefined();
        body.should.have.property('name', null);
      });

      it.skip('字段超长时应该修改返回服务器错误', async () => {
        const id = 2;
        const name = repeat('*', 50);
        const test = request(app.listen());
        const res = await test.put(`/books/${id}`).send({ name });
        const { body: { code } } = res;
        code.should.eql('ER_DATA_TOO_LONG');
      });

      it('修改不存在的记录应该返回服务器错误', async () => {
        const id = 100;
        const name = 'name';
        const test = request(app.listen());
        const { body: { message } } = await test.put(`/books/${id}`).send({ name });
        message.should.eql('No Rows Updated');
      });
    });

    describe('删除', () => {
      it('应该成功删除存在的记录', async () => {
        const id = 1;
        const test = request(app.listen());
        await test.delete(`/books/${id}`);
        const { body: { message } } = await test.get(`/books/${id}`);
        message.should.eql('EmptyResponse');
        const res = await test.get('/books');
        res.body.should.have.length(ROW_COUNT - 1);
      });

      it('删除不存在的记录应该返回404', async () => {
        const id = 100;
        const test = request(app.listen());
        const { body: { message } } = await test.delete(`/books/${id}`);
        message.should.eql('EmptyResponse');
      });
    });
  });

  describe('自定义中间件', () => {
    const bodyText = 'body';
    const beforeMiddlewares = async (ctx, next) => {
      ctx.set('beforeMiddlewares', 'true');
      await next();
    };
    const afterMiddlewares = async (ctx, next) => {
      ctx.set('afterMiddlewares', 'true');
      await next();
    };
    const middleware = async (ctx, next) => {
      ctx.body = bodyText;
      await next();
    };
    const app = new Qails(bodyParserMiddleware());
    const resource = Resource.define(Book, {
      setup(router) {
        router
          .create(middleware, {
            beforeMiddlewares,
            afterMiddlewares
          })
          .read({
            beforeMiddlewares,
            afterMiddlewares
          })
          .update(middleware, {
            beforeMiddlewares,
            afterMiddlewares
          })
          .destroy(middleware, {
            beforeMiddlewares,
            afterMiddlewares
          });
      }
    });
    app.use(resource.routes());

    describe('查询', () => {
      it('查询列表', (done) => {
        request(app.listen())
          .get('/books')
          .expect(200, (err, res) => {
            const { header, body } = res;
            header.should.have.property('beforemiddlewares', 'true');
            header.should.have.property('aftermiddlewares', 'true');
            body.should.have.length(ROW_COUNT);
            return done();
          });
      });
      it('查询详情', (done) => {
        const id = 1;
        request(app.listen())
          .get(`/books/${id}`)
          .expect(200, (err, res) => {
            const { header, body } = res;
            header.should.have.property('beforemiddlewares', 'true');
            header.should.have.property('aftermiddlewares', 'true');
            body.should.have.property('id', id);
            return done();
          });
      });
    });

    it('新增', (done) => {
      request(app.listen())
        .post('/books')
        .expect(bodyText, (err, res) => {
          const { header } = res;
          header.should.have.property('beforemiddlewares', 'true');
          header.should.have.property('aftermiddlewares', 'true');
          return done();
        });
    });
    it('修改', (done) => {
      request(app.listen())
        .put('/books/1')
        .expect(bodyText, (err, res) => {
          const { header } = res;
          header.should.have.property('beforemiddlewares', 'true');
          header.should.have.property('aftermiddlewares', 'true');
          return done();
        });
    });
    it('删除', (done) => {
      request(app.listen())
        .delete('/books/1')
        .expect(bodyText, (err, res) => {
          const { header } = res;
          header.should.have.property('beforemiddlewares', 'true');
          header.should.have.property('aftermiddlewares', 'true');
          return done();
        });
    });
  });

  describe('自定义初始化参数', async () => {
    const app = new Qails(bodyParserMiddleware());
    const resource = Resource.define(Book, {
      id: 'id',
      root: '/api/books'
    });
    app.use(resource.routes());
    it('使用/books应该获取不到数据', async () => {
      const { status } = await request(app.listen()).get('/books');
      status.should.eql(404);
    });
    it('使用/books/:id应该获取不到数据', async () => {
      const { status } = await request(app.listen()).get('/books/1');
      status.should.eql(404);
    });
    it('使用/api/books应该获取到数据', async () => {
      const { body } = await request(app.listen()).get('/api/books');
      body.should.have.length(ROW_COUNT);
    });
    it('使用/api/books/:id应该获取到数据', async () => {
      const { body } = await request(app.listen()).get('/api/books/1');
      body.should.have.property('id', 1);
    });
  });

  describe('不使用模型插件', () => {
    const { Model } = require('../../src/util/bookshelf');
    const BookWithoutPlugin = class extends Model {
      get tableName() { return TABLE_BOOKS; }
      get hasTimestamps() { return false; }
    };
    const app = new Qails(bodyParserMiddleware());
    app.use(Resource.define(BookWithoutPlugin).routes());

    it('应该新增记录成功', (done) => {
      const id = ROW_COUNT + 1;
      const test = request(app.listen());
      test
        .post('/books')
        .send({ id })
        .end(() => {
          test
            .get(`/books/${id}`)
            .end((err, res) => {
              const { body } = res;
              body.should.have.property('id', id);
              return done();
            });
        });
    });

    it('修改存在的记录应该返回修改后的记录', (done) => {
      const id = 1;
      const name = 'name';
      const test = request(app.listen());
      test
        .put(`/books/${id}`)
        .send({ name })
        .end(() => {
          test
            .get(`/books/${id}`)
            .end((err, res) => {
              const { body } = res;
              body.should.have.property('name', name);
              return done();
            });
        });
    });

    it('应该返回所有记录', (done) => {
      request(app.listen())
        .get('/books')
        .end((err, res) => {
          const { body } = res;
          should(body).be.not.undefined();
          body.should.have.length(ROW_COUNT);
          return done();
        });
    });
  });
});
