import Router from 'koa-router';

const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.render('index');
  await next();
});

export default router;
