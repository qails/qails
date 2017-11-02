import { resolve } from 'path';
import serve from 'koa-static';

export default (root, options) => {
  const serveRoot = root || resolve(process.cwd(), 'static');
  return serve(serveRoot, options);
};
