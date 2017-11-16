/**
 * 为 ctx.body 增加公共封皮的中间件
 *
 * RESTful APIs 规范中，接口返回数据只包含消息体：
 *   { id: 1, name: 'foo' }
 *
 * 但有些开发者喜欢在消息体外面在包装一层，比如增加自定义的消息码：
 *  { code: 0, message: 'Success', data: { id: 1, name: 'foo' } }
 * 这个中间件就是为了满足这种需求的
 *
 * 原理：
 *   在前一个中间件中为 code 和 message 赋值，通过 ctx.state 传递到该中间件
 *
 * 注意：
 *   - 该中间件注册的位置应该尽量考后
 *   - 前一个中间件需要在 await next() 之前设置 ctx.body 和 ctx.state
 */

import { isEmpty } from 'lodash';

export default async (ctx, next) => {
  await next();
  const { state: { code, message }, body } = ctx;

  if (code !== undefined) {
    const json = { code, message };
    if (!isEmpty(body)) {
      json.data = body;
    }
    ctx.body = json;
    ctx.status = 200;
  }
};
