import session from 'koa-session';

export default (app, options = {}) => {
  const { keys = 'please_modify_it' } = options;
  app.koa.keys = [keys];
  app.use(session(options, app.koa));
};
