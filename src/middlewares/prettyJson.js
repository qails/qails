import json from 'koa-json';

export default (options) => {
  const pretty = process.env.NODE_ENV !== 'production';
  return json({ pretty, ...options });
};
