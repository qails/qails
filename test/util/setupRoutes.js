import request from 'supertest';
import should from 'should';
import { writeFileSync } from 'fs';
import { ensureDirSync, removeSync } from 'fs-extra';
import { resolve } from 'path';
import { Qails } from '../../src';
import setupRoutes from '../../src/util/setupRoutes';

describe('util::setupRoutes', () => {
  const filename = 'index.js';
  const root = resolve('.tmp', 'routes');
  const sub = resolve(root, 'sub');
  const endpointRoot = '/';
  const endpointSub = '/sub';
  const getText = endpoint => `
    import Router from 'koa-router';
    const router = new Router();
    router.get('${endpoint}', async (ctx) => {
      ctx.body = '${endpoint}';
    });
    export default router;
  `;

  ensureDirSync(sub);

  const homeRouter = resolve(root, filename);
  writeFileSync(homeRouter, getText(endpointRoot));

  const subRouter = resolve(sub, filename);
  writeFileSync(subRouter, getText(endpointSub));

  it('设置不存在的routes目录应该报错', () => {
    const app = new Qails();
    try {
      setupRoutes(app);
      should.fail();
    } catch (e) {
      e.should.have.property('errno', -2);
    }
  });

  const app = new Qails();
  const dirname = resolve(process.cwd(), '.tmp/routes');
  setupRoutes(app, dirname);

  it('一级目录路由解析应该正常', (done) => {
    request(app.listen())
      .get(endpointRoot)
      .end((err, res) => {
        res.should.have.property('text', endpointRoot);
        return done();
      });
  });

  it('多级目录路由解析应该正常', (done) => {
    request(app.listen())
      .get(endpointSub)
      .end((err, res) => {
        res.should.have.property('text', endpointSub);
        removeSync(root);
        return done();
      });
  });
});
