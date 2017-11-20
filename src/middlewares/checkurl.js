/**
 * 为 Jenkis 发布系统创建 checkurl 路由
 * QUNAR-ONLY
 */

import Router from 'koa-router';

const router = new Router();

router.get('/checkurl', async (ctx) => {
  ctx.status = 200;
  ctx.body = 'ok';
});

export default router;
