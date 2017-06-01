import { join } from 'path';
import Koa from 'koa';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import qs from 'koa-qs';
import morgan from 'koa-morgan';
import FileStreamRotator from 'file-stream-rotator';
import mkdirp from 'mkdirp';

const cwd = process.cwd();
const { JSON_PRETTY, PORT = 4000 } = process.env;

// 创建日志目录
const logDir = join(cwd, 'logs');
mkdirp.sync(logDir);

// create a rotating write stream
const accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: `${logDir}/access__%DATE%.log`,
  frequency: 'daily',
  verbose: false
});

const app = new Koa();
qs(app);
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser());
app.use(json({ pretty: JSON_PRETTY === 'true' }));

app.start = () => {
  app.listen(PORT, (err) => {
    if (err) {
      throw err;
    }

    console.log('✅ qails listening on port %s', PORT);
  });
};

export default app;
