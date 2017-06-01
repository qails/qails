import { hostname } from 'os';
import SDC from 'statsd-client';

const { WATCHER_ENABLE, WATCHER_HOST, WATCHER_PORT, WATCHER_PREFIX } = process.env;
const name = hostname().split('.')[0] || 'default';

const sdc = new SDC({
  host: WATCHER_HOST,
  port: WATCHER_PORT,
  prefix: WATCHER_PREFIX
});

export const increment = (key, count) => {
  if (WATCHER_ENABLE === 'true') {
    sdc.increment(`${key}.${name}`, count);
  }
};

export const gauge = (key, count) => {
  if (WATCHER_ENABLE === 'true') {
    sdc.gauge(`${key}.${name}`, count);
  }
};

export const timing = (key, timer) => {
  if (WATCHER_ENABLE === 'true') {
    sdc.timing(`${key}.${name}`, timer);
  }
};
