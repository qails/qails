import { resolve } from 'path';
import {
  Qails,
  accessLogMiddleware,
  bodyParserMiddleware,
  prettyJsonMiddleware,
  serveMiddleware,
  pug,
  requireAllRouters
} from 'qails';

const port = 12345;

const app = new Qails([
  accessLogMiddleware(),
  bodyParserMiddleware(),
  prettyJsonMiddleware(),
  serveMiddleware(),
  // 引用 jquery.js
  serveMiddleware(resolve('node_modules/jquery/dist'))
]);
pug(app, { viewPath: resolve('templates/pages') });
requireAllRouters(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`✅ qails listening on port ${port}`);
});
