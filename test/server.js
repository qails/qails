require('dotenv').config({ path: './test/.env' });
// require('dotenv').config();

// 注意：
// 使用import { Qails } from '../src'这种写法有问题
// 会导致先引用qails，再引用dotenv
const Qails = require('../src').Qails;

const app = new Qails();

app.listen(4000, (err) => {
  if (err) {
    throw err;
  }

  console.log('✅ qails listening on port 4000');
});

export default app;
