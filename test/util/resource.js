import should from 'should';
import request from 'supertest';
import mask from 'bookshelf-mask';
import { range, first, last } from 'lodash';
import { base, Qails, Resource } from '../../src';
import magicCase from '../../src/util/magicCase';
import bodyParser from '../../src/middlewares/bodyParser';

const ROW_COUNT = 15;
const TABLE_BOOKS = 'books';
const TABLE_CHAPTERS = 'chapters';

base.plugin(mask);
base.plugin(magicCase);
const Chapter = class extends base.Model {
  get tableName() { return TABLE_CHAPTERS; }
  get hasTimestamps() { return false; }
};

const Book = class extends base.Model {
  get tableName() { return TABLE_BOOKS; }
  get hasTimestamps() { return false; }
  chapters() {
    return this.hasMany(Chapter);
  }
};

before(async () => {
  await base.knex.schema
    .dropTableIfExists(TABLE_BOOKS)
    .createTable(TABLE_BOOKS, (table) => {
      table.increments();
      table.string('name');
    })
    .dropTableIfExists(TABLE_CHAPTERS)
    .createTable(TABLE_CHAPTERS, (table) => {
      table.integer('book_id');
    });

  await base.knex(TABLE_CHAPTERS)
    .insert(range(1, ROW_COUNT + 1).map(item => ({ book_id: item })));
});

beforeEach(async () => {
  await base.knex(TABLE_BOOKS).insert(range(1, ROW_COUNT + 1).map(item => ({ id: item })));
});

afterEach(async () => {
  await base.knex(TABLE_BOOKS).del();
});

after(async () => {
  await base.knex.schema
    .dropTableIfExists(TABLE_BOOKS)
    .dropTableIfExists(TABLE_CHAPTERS);
});

describe('Resource', () => {
  describe('Resource.define()', () => {
    const app = new Qails(bodyParser());
    app.use(Resource.define(Book.collection()).routes());

    describe('查询', () => {
      describe('查询列表', () => {
        describe('无查询条件', () => {
          it('应该返回所有记录', (done) => {
            request(app.listen())
              .get('/books')
              .end((err, res) => {
                const { body: { data } } = res;
                should(data).be.not.undefined();
                data.should.have.length(ROW_COUNT);
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
                  const { body: { data } } = res;
                  should(data).be.not.undefined();
                  first(data).should.have.property('id', id);
                  return done();
                });
            });
            it('where=id&where==&where=2', (done) => {
              const id = 2;
              request(app.listen())
                .get(`/books?where=id&where==&where=${id}`)
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  should(data).be.not.undefined();
                  first(data).should.have.property('id', id);
                  return done();
                });
            });
            it('长度对3取模后余数不足三的数组类型参数应该无效', (done) => {
              request(app.listen())
                .get('/books?where=id')
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  data.should.have.length(ROW_COUNT);
                  return done();
                });
            });
            it('无记录返回', (done) => {
              const id = -1;
              request(app.listen())
                .get(`/books?where[id]=${id}`)
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  res.body.should.have.property('code', 0);
                  res.body.should.have.property('message', 'Success');
                  res.body.should.not.have.property('data');
                  return done();
                });
            });
          });

          describe('andWhere', () => {
            it('应该支持对象类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&andWhere[id]=3')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  should(data).be.undefined();
                  return done();
                });
            });
            it('应该支持数组类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&andWhere=id&andWhere==&andWhere=3')
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  should(data).be.undefined();
                  return done();
                });
            });
            it('不完整的数组类型参数应该无效', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&andWhere=id')
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  data.should.have.length(1);
                  first(data).should.have.property('id', 2);
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
            it('应该支持对象类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&orWhere[id]=3')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  data.should.have.length(2);
                  first(data).should.have.property('id', 2);
                  last(data).should.have.property('id', 3);
                  return done();
                });
            });
            it('应该支持数组类型参数', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&orWhere=id&orWhere==&orWhere=3')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  data.should.have.length(2);
                  first(data).should.have.property('id', 2);
                  last(data).should.have.property('id', 3);
                  return done();
                });
            });
            it('不完整的数组类型参数应该无效', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&orWhere=id')
                .expect('Content-Type', /json/)
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  data.should.have.length(1);
                  first(data).should.have.property('id', 2);
                  return done();
                });
            });
            it('长度对3取模后余数不足三的数组类型参数应该无效', (done) => {
              request(app.listen())
                .get('/books?where[id]=2&orWhere=id&orWhere==')
                .expect(200, (err, res) => {
                  const { body: { data } } = res;
                  data.should.have.length(1);
                  first(data).should.have.property('id', 2);
                  return done();
                });
            });
          });
        });
        describe('mask', () => {
          it('字段存在', (done) => {
            const showColumn = 'name';
            request(app.listen())
              .get(`/books?mask=${showColumn}`)
              .end((err, res) => {
                const { body: { code, data } } = res;
                code.should.eql(0);
                first(data).should.not.have.property('id');
                first(data).should.have.property(showColumn);
                return done();
              });
          });
          it('字段不存在', (done) => {
            const showColumn = 'notexist';
            request(app.listen())
              .get(`/books?mask=${showColumn}`)
              .end((err, res) => {
                const { body: { code, data } } = res;
                code.should.eql(0);
                first(data).should.not.have.property(showColumn);
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
                const { body: { code, data } } = res;
                code.should.eql(0);
                first(data).should.have.property('id', 1);
                return done();
              });
          });
          it('反向排序', (done) => {
            const column = '-id';
            request(app.listen())
              .get(`/books?sort=${column}`)
              .end((err, res) => {
                const { body: { code, data } } = res;
                code.should.eql(0);
                first(data).should.have.property('id', 15);
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
                const { body: { data } } = res;
                should(data).be.not.undefined();
                data.should.have.length(ROW_COUNT);
                first(data).should.have.property('chapters');
                return done();
              });
          });
          it('embed存在', (done) => {
            request(app.listen())
              .get('/books?embed=chapters')
              .expect('Content-Type', /json/)
              .expect(200, (err, res) => {
                const { body: { data } } = res;
                should(data).be.not.undefined();
                data.should.have.length(ROW_COUNT);
                first(data).should.have.property('chapters');
                return done();
              });
          });
          it('withRelated不存在应该返回500状态码', (done) => {
            const embed = 'xxx';
            request(app.listen())
              .get(`/books?embed=${embed}`)
              .end((err, res) => {
                const { body } = res;
                body.should.have.property('code', 500);
                body.should.have.property('message', `Error: ${embed} is not defined on the model.`);
                body.should.not.have.property('data');
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
                const { body: { data: { pagination, list } } } = res;
                pagination.should.have.property('page', 1);
                pagination.should.have.property('pageSize', 10);
                pagination.should.have.property('rowCount', ROW_COUNT);
                pagination.should.have.property('pageCount', 2);
                list.should.have.length(10);
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
                const { body: { data: { pagination, list } } } = res;
                pagination.should.have.property('page', page);
                pagination.should.have.property('pageSize', pageSize);
                pagination.should.have.property('rowCount', ROW_COUNT);
                pagination.should.have.property('pageCount', pageCount);
                list.should.have.length(pageSize);
                first(list).should.have.property('id', ((page - 1) * pageSize) + 1);
                return done();
              });
          });

          it('获取分页记录(mask)', (done) => {
            const showColumn = 'name';
            request(app.listen())
              .get(`/books?offset=0&mask=${showColumn}&sort=${showColumn}`)
              .end((err, res) => {
                const { body: { code, data: { list } } } = res;
                code.should.eql(0);
                first(list).should.not.have.property('id');
                first(list).should.have.property(showColumn);
                return done();
              });
          });
          it('withRelated不存在时应该返回状态码500', (done) => {
            const embed = 'xxx';
            request(app.listen())
              .get(`/books?offset=0&embed=${embed}`)
              .end((err, res) => {
                const { body } = res;
                body.should.have.property('code', 500);
                body.should.have.property('message', `Error: ${embed} is not defined on the model.`);
                body.should.not.have.property('data');
                return done();
              });
          });
        });
      });
      describe('查询详情', () => {
        it('获取一条存在的记录', (done) => {
          const id = 1;
          request(app.listen())
            .get(`/books/${id}?embed=chapters`)
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
              const { body: { data } } = res;
              should(data).be.not.undefined();
              data.should.have.property('id', id);
              data.should.have.property('chapters');
              return done();
            });
        });

        it('获取一条存在的记录(withRelated)', (done) => {
          const id = 1;
          request(app.listen())
            .get(`/books/${id}?withRelated=chapters`)
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
              const { body: { data } } = res;
              should(data).be.not.undefined();
              data.should.have.property('id', id);
              data.should.have.property('chapters');
              return done();
            });
        });

        it('mask', (done) => {
          const showColumn = 'name';
          const id = 1;
          request(app.listen())
            .get(`/books/${id}?mask=${showColumn}`)
            .end((err, res) => {
              const { body: { code, data } } = res;
              code.should.eql(0);
              data.should.not.have.property('id');
              data.should.have.property(showColumn);
              return done();
            });
        });

        it('获取一条不存在的记录', (done) => {
          const id = 100;
          request(app.listen())
            .get(`/books/${id}`)
            .expect(200, (err, res) => {
              const { body: { code, message } } = res;
              code.should.eql(404);
              message.should.eql('Not found');
              return done();
            });
        });
      });
    });

    describe('新增', () => {
      it('新增记录', (done) => {
        const id = ROW_COUNT + 1;
        const test = request(app.listen());
        test
          .post('/books')
          .send({ id })
          .end(() => {
            test
              .get(`/books/${id}`)
              .end((err, res) => {
                should(err).be.a.null();
                const { body: { data } } = res;
                should(data).be.not.undefined();
                data.should.have.property('id', id);
                return done();
              });
          });
      });
    });

    describe('修改', () => {
      it('修改存在的记录', (done) => {
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
                should(err).be.a.null();
                const { body: { data } } = res;
                should(data).be.not.undefined();
                data.should.have.property('name', name);
                return done();
              });
          });
      });

      it('修改不存在的记录', (done) => {
        const id = 100;
        const name = 'name';
        const test = request(app.listen());
        test
          .put(`/books/${id}`)
          .send({ name })
          .end((err, res) => {
            const { body: { code, message } } = res;
            code.should.eql(404);
            message.should.eql('Not found');
            return done();
          });
      });
    });

    describe('删除', () => {
      it('删除存在的记录', (done) => {
        const id = 1;
        const test = request(app.listen());
        test
          .delete(`/books/${id}`)
          .end(() => {
            test
              .get(`/books/${id}`)
              .end((err, res) => {
                const { body: { code, message } } = res;
                code.should.eql(404);
                message.should.eql('Not found');
                return done();
              });
          });
      });

      it('删除不存在的记录', (done) => {
        const id = 100;
        const test = request(app.listen());
        test
          .delete(`/books/${id}`)
          .end((err, res) => {
            const { body: { code, message } } = res;
            code.should.eql(404);
            message.should.eql('Not found');
            return done();
          });
      });
    });
  });

  describe('自定义中间件', () => {
    const body = 'body';
    const beforeMiddlewares = async (ctx, next) => {
      ctx.set('beforeMiddlewares', 'true');
      await next();
    };
    const afterMiddlewares = async (ctx, next) => {
      ctx.set('afterMiddlewares', 'true');
      await next();
    };
    const middleware = async (ctx, next) => {
      ctx.body = body;
      await next();
    };
    const app = new Qails(bodyParser());
    const resource = Resource.define({
      collection: Book.collection(),
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
            const { header, body: { data } } = res;
            header.should.have.property('beforemiddlewares', 'true');
            header.should.have.property('aftermiddlewares', 'true');
            data.should.have.length(ROW_COUNT);
            return done();
          });
      });
      it('查询详情', (done) => {
        const id = 1;
        request(app.listen())
          .get(`/books/${id}`)
          .expect(200, (err, res) => {
            const { header, body: { data } } = res;
            header.should.have.property('beforemiddlewares', 'true');
            header.should.have.property('aftermiddlewares', 'true');
            data.should.have.property('id', id);
            return done();
          });
      });
    });

    it('新增', (done) => {
      request(app.listen())
        .post('/books')
        .expect(body, (err, res) => {
          const { header } = res;
          header.should.have.property('beforemiddlewares', 'true');
          header.should.have.property('aftermiddlewares', 'true');
          return done();
        });
    });
    it('修改', (done) => {
      request(app.listen())
        .put('/books/1')
        .expect(body, (err, res) => {
          const { header } = res;
          header.should.have.property('beforemiddlewares', 'true');
          header.should.have.property('aftermiddlewares', 'true');
          return done();
        });
    });
    it('删除', (done) => {
      request(app.listen())
        .delete('/books/1')
        .expect(body, (err, res) => {
          const { header } = res;
          header.should.have.property('beforemiddlewares', 'true');
          header.should.have.property('aftermiddlewares', 'true');
          return done();
        });
    });
  });
});
