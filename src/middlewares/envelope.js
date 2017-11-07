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
