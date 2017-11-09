const { Qails } = require('qails');

const app = new Qails();
app.use(async (ctx, next) => {
  ctx.body = 'Hello world';
  await next();
});

const port = 12345;
app.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`✅ qails listening on port ${port}`);
});
