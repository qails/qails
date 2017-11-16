const { Qails } = require('qails');

// PORT是在个性化profile中设置的
// APP_NAME是在通用profile中设置的
const { PORT, APP_NAME } = process.env;

const app = new Qails();
app.use(async (ctx, next) => {
  ctx.body = APP_NAME;
  await next();
});

app.listen(PORT, (err) => {
  if (err) {
    throw err;
  }

  console.log(`✅ qails listening on port ${PORT}`);
});
