import should from 'should';
import request from 'supertest';
import { range, first } from 'lodash';
import { base, Model, Qails, Resource } from '../../src';

const ROW_COUNT = 15;
const TABLE_NAME = 'books';
const Book = class extends Model {
  get tableName() { return TABLE_NAME; }
  get hasTimestamps() { return false; }
};

before(async () => {
  await base.knex.schema
    .dropTableIfExists(TABLE_NAME)
    .createTable(TABLE_NAME, (table) => {
      table.increments();
      table.string('name');
    });
});

beforeEach(async () => {
  await base.knex(TABLE_NAME).insert(range(1, ROW_COUNT + 1).map(item => ({ id: item })));
});

afterEach(async () => {
  await base.knex(TABLE_NAME).del();
});

after(async () => {
  await base.knex.schema.dropTableIfExists(TABLE_NAME);
});

describe('define()', () => {
  const app = new Qails({ middlewares: ['body'] });
  app.use(Resource.define(Book.collection()).routes());

  it('获取所有数据', (done) => {
    request(app.listen())
      .get('/books')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const { body: { data } } = res;
        should(data).be.not.undefined();
        data.should.have.length(ROW_COUNT);
        return done();
      });
  });

  it('默认分页', (done) => {
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

  it('自定义分页', (done) => {
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

  it('新增数据', (done) => {
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

  it('修改数据', (done) => {
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

  it('获取一条数据', (done) => {
    const id = 1;
    request(app.listen())
      .get(`/books/${id}`)
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const { body: { data } } = res;
        should(data).be.not.undefined();
        data.should.have.property('id', id);
        return done();
      });
  });
});
