import should from 'should';
import request from 'supertest';
import { existsSync, statSync, readFileSync } from 'fs';
import { removeSync } from 'fs-extra';
import { resolve } from 'path';
import moment from 'moment';
import { Qails } from '../../src';
import accessLog from '../../src/middlewares/accessLog';

describe('middlewares::accessLog', () => {
  const logRoot = resolve('logs');
  const timestamp = moment().format('YYYYMMDD');
  const filename = 'access__%DATE%.log';
  const fullPath = resolve(logRoot, filename).replace('%DATE%', timestamp);

  it('日志默认目录不应该存在日志文件', (done) => {
    removeSync(logRoot);
    const app = new Qails();
    request(app.listen())
      .get('/')
      .end(() => {
        existsSync(fullPath).should.be.false();
        removeSync(logRoot);
        return done();
      });
  });

  it('日志默认目录应该存在日志文件', (done) => {
    removeSync(logRoot);
    const app = new Qails(accessLog());
    request(app.listen())
      .get('/')
      .end(() => {
        existsSync(fullPath).should.be.true();
        const { size } = statSync(fullPath);
        should(size).not.eql(0);
        removeSync(logRoot);
        return done();
      });
  });

  it('应该在指定位置生成日志文件', (done) => {
    const customLogRoot = resolve('.tmp', 'logs');
    const customFilename = '%DATE%.log';
    const customDateFormat = moment().format('YYYY-MM-DD-HH');
    const customFullPath = resolve(customLogRoot, customFilename).replace('%DATE%', customDateFormat);

    removeSync(customLogRoot);
    const app = new Qails(accessLog({
      root: customLogRoot,
      filename: customFilename,
      dateFormat: 'YYYY-MM-DD-HH',
      frequency: 'custom'
    }));
    request(app.listen())
      .get('/')
      .end(() => {
        existsSync(customFullPath).should.be.true();
        const { size } = statSync(customFullPath);
        should(size).not.eql(0);
        removeSync(customLogRoot);
        return done();
      });
  });

  it('应该生成指定格式的日志记录', (done) => {
    removeSync(logRoot);
    const app = new Qails(accessLog({}, ':status'));
    request(app.listen())
      .get('/')
      .end(() => {
        existsSync(fullPath).should.be.true();
        const contents = readFileSync(fullPath, { encoding: 'utf8' });
        contents.should.eql('404\n');
        removeSync(logRoot);
        return done();
      });
  });
});
