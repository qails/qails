import request from 'supertest';
import should from 'should';
import { range } from 'lodash';
import { word } from 'casual';
import { buildSchema } from 'graphql';
import { Qails, base, Model } from '../../src';
import graphql from '../../src/middlewares/graphql';
import { fetchAll, fetchOne } from '../../src/util/graphql';

const ROW_COUNT = 15;
const TABLE_BOOKS = 'books';
const TABLE_CHAPTERS = 'chapters';

before(async () => {
  await base.knex.schema
    .dropTableIfExists(TABLE_BOOKS)
    .createTable(TABLE_BOOKS, (table) => {
      table.increments();
      table.string('name');
    })
    .dropTableIfExists(TABLE_CHAPTERS)
    .createTable(TABLE_CHAPTERS, (table) => {
      table.increments();
      table.string('name');
      table.integer('book_id');
    });

  const bookData = range(1, ROW_COUNT + 1).map(item => ({ id: item, name: word }));
  const chapterData = range(1, ROW_COUNT + 1).map(item => ({
    id: item,
    name: word,
    book_id: item
  }));

  await base.knex(TABLE_BOOKS).insert(bookData);
  await base.knex(TABLE_CHAPTERS).insert(chapterData);
});

after(async () => {
  await base.knex.schema
    .dropTableIfExists(TABLE_BOOKS)
    .dropTableIfExists(TABLE_CHAPTERS);
});

describe('util::graphql', () => {
  const Chapter = class extends Model {
    get tableName() { return 'chapters'; }
  };
  const Book = class extends Model {
    get tableName() { return 'books'; }
    posts() {
      return this.hasMany(Chapter);
    }
  };

  const schema = buildSchema(`
    type Book {
      id: ID!
      chapters: [Chapter]
    }
    type Chapter {
      id: ID!
      book_id: Int
    }
    type Query {
      books(withRelated: String, where: [String], andWhere: [String], orWhere: [String], sort: String, page: Int, pageSize: Int, limit: Int, offset: Int): [Book]
      book(id: Int!, withRelated: String): Book
    }
  `);

  const root = {
    books: async (query) => {
      const books = await fetchAll(Book, query);
      return books;
    },
    book: async ({ id, ...query }) => {
      const book = await fetchOne(Book, id, query);
      return book;
    }
  };

  const app = new Qails([
    graphql({
      schema,
      rootValue: root
    })
  ]);

  it('应该返回所有书本的ID', async () => {
    const { body: { data: { books } } } = await request(app.listen()).get('/graphql/?query={books{id}}');
    should(books).not.empty();
    books.should.have.length(ROW_COUNT);
  });
});
