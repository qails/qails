import { router } from '../../..';

router.get('/pug', async (ctx) => {
  ctx.render('index');
});

export default router;
