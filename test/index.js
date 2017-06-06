import { join } from 'path';
import request from 'supertest';
import { Qails } from '../src';

const app = new Qails({
  routePath: join(__dirname, 'routes')
});

app.listen(4000, (err) => {
  if (err) {
    throw err;
  }

  console.log('✅ qails listening on port 4000');
});

request(app.server)
  .get('/')
  // .expect('Content-Type', /json/)
  // .expect('Content-Length', '15')
  .expect(200)
  .expect('Content-Type', 'text/plain')
  .end((err, res) => {
    if (err) throw err;
    console.log(res);
  });
