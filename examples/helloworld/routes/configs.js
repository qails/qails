import { router } from '../../..';
import Config from '../models/config';

router.get('/configs', async (ctx) => {
  await Config.findAll().then((result) => {
    ctx.body = result;
  });
});

export default router;
