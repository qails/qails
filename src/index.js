// eslint-disable-next-line
require('dotenv').config();

export { default as app } from './server';
export { default as setupRoutes } from './util/setup-routes';
export { default as Resource } from './util/resource';
export { default as base, Model, Collection } from './util/base';
