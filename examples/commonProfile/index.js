require('./dotenv');

const { Qails } = require('qails');

const { PORT } = process.env;

const app = new Qails();
app.use(async (ctx, next) => {
  const customEnv = {};
  const keys = Object.keys(process.env);
  const index = keys.indexOf('NODE_ENV');
  keys.forEach((key, i) => {
    if (i >= index) {
      customEnv[key] = process.env[key];
    }
  });

  ctx.body = customEnv;
  await next();
});

app.listen(PORT, (err) => {
  if (err) {
    throw err;
  }

  console.log(`✅ qails listening on port ${PORT}`);
});
