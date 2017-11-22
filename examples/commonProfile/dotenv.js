const glob = require('packing-glob');
const dotenv = require('dotenv');

// 加载 process.env.NODE_ENV
dotenv.config();

// 当加载 .env 失败时，终止程序
const { NODE_ENV } = process.env;
if (!NODE_ENV) {
  console.log([
    '[error]: The .env file is not found. ',
    'Please run the following command to create the file in the root of the project:',
    'echo NODE_ENV=local > .env'
  ].join('\n'));
  process.exit(1);
}

// 按 NODE_ENV -> common 顺序加载配置
[NODE_ENV, 'common'].forEach((profile) => {
  const envs = glob(`profiles/${profile}/**/*.env`);
  envs.forEach((env) => {
    dotenv.config({ path: env });
    console.log(`[dotenv]\`${env}\` loaded.`);
  });
});
