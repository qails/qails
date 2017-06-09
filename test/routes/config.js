import Router from 'koa-router';
import Config from '../models/config';

const router = new Router();
router.get('/configs', async (ctx) => {
  console.log(ctx);
  await Config.findAll().then((result) => {
    ctx.body = result;
  });
});

export default router;
