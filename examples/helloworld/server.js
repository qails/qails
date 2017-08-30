import { Qails } from '../../src';

const { PORT } = process.env;

const app = new Qails();

app.listen(PORT, (err) => {
  if (err) {
    throw err;
  }

  console.log(`✅ qails listening on port ${PORT}`);
});

export default app;
