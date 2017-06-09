import { join } from 'path';
import { Qails } from '../src';

const app = new Qails({
  routePath: join(__dirname, 'routes'),
  corsConfig: {
    enable: true,
    origin: 'http://touch.qunar.com,https://touch.qunar.com',
    allowMethods: ['GET']
  }
});

app.listen(4000, (err) => {
  if (err) {
    throw err;
  }

  console.log('✅ qails listening on port 4000');
});

export default app;
