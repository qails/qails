// eslint-disable-next-line
// require('dotenv').config();

export { default as Qails } from './qails';
// export { default as setupRoutes } from './util/setup-routes';
export { default as Resource } from './util/resource';
export { default as router } from './util/router';
export { default as envelope } from './util/response-envelope';
export { increment, gauge, timing } from './util/watcher';
export { default as base, Model, Collection } from './util/base';
export { snake } from './util/magic-case';
