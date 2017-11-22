const {
  Qails,
  accessLogMiddleware,
  bodyParserMiddleware,
  corsMiddleware,
  envelopeMiddleware,
  graphqlMiddleware,
  prettyJsonMiddleware,
  serveMiddleware,
  pug,
  session,
  requireAllRouters
} = require('qails');

const app = new Qails([
  accessLogMiddleware(/* options here */),
  bodyParserMiddleware(/* options here */),
  corsMiddleware(/* options here */),
  envelopeMiddleware,
  graphqlMiddleware(/* options here */),
  prettyJsonMiddleware(/* options here */),
  serveMiddleware(/* options here */)
]);
pug(app);
session(app);
requireAllRouters(app);
app.use(async (ctx, next) => {
  ctx.body = 'Buildin middlewares';
  await next();
});

const port = 12345;
app.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`✅ qails listening on port ${port}`);
});
