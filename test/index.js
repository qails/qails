import { join } from 'path';
import request from 'supertest';
import { app, setupRoutes } from '..';

setupRoutes(app, join(__dirname, 'routes'));

app.listen(4000, (err) => {
  if (err) {
    throw err;
  }

  console.log('✅ koa listening on port 4000');
});

request(app)
  .get('/')
  .expect('Content-Type', /json/)
  .expect('Content-Length', '15')
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
  });
