import Router from 'koa-router';

const router = new Router();
router.get('/pug', async (ctx) => {
  ctx.render('index');
});

export default router;
