const {
  Qails,
  corsMiddleware
} = require('qails');

const header = async (ctx, next) => {
  ctx.body = '<h1>header</h1>';
  await next();
};

const body = async (ctx, next) => {
  ctx.body += '<h2>body<h2>';
  await next();
};

const footer = async (ctx, next) => {
  ctx.body += '<h3>footer<h3>';
  await next();
};

const app = new Qails([
  header,
  corsMiddleware(),
  body
]);

// 可以继续追加中间件
app.use(footer);

const port = 12345;
app.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`✅ qails listening on port ${port}`);
});
