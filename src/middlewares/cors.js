/**
 * 允许接口被跨域调用的中间件
 * @see https://github.com/zadzbw/koa2-cors
 */

import cors from 'koa2-cors';

export default options => cors(options);
