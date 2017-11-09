import Pug from 'koa-pug';

export default (app, options) => {
  const pug = new Pug({
    viewPath: 'templates',
    ...options
  });
  pug.use(app.koa);
};
