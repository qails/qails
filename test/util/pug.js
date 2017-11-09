import request from 'supertest';
import { writeFileSync, unlinkSync } from 'fs';
import { resolve, basename } from 'path';
import should from 'should';
import { Qails } from '../../src';
import pug from '../../src/util/pug';

describe('util::pug', () => {
  const name = basename(__filename);
  const templateString = '| #{name}';

  it('应该正确的从模版字符串返回解析后的HTML', (done) => {
    const app = new Qails();
    pug(app);
    app.use(async (ctx) => {
      ctx.render(templateString, { name }, { fromString: true });
    });
    request(app.listen())
      .get('/')
      .expect(name, done);
  });

  it('应该能正确的从模版文件返回解析后的HTML', (done) => {
    const filename = 'test.pug';
    const template = resolve('.tmp', filename);
    writeFileSync(template, '| #{name}');

    const app = new Qails();
    pug(app, { viewPath: '.tmp' });
    app.use(async (ctx) => {
      ctx.render(filename, { name });
    });
    request(app.listen())
      .get('/')
      .end((err, res) => {
        should(res.text).eql(name);
        unlinkSync(template);
        return done();
      });
  });
});
