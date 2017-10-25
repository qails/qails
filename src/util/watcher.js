import { hostname } from 'os';
import SDC from 'statsd-client';

const {
  WATCHER_ENABLE,
  WATCHER_HOST,
  WATCHER_PORT,
  WATCHER_PREFIX,
  WATCHER_MACHINE_RECORD
} = process.env;

const fixedHostName = `.${hostname().replace('.', '_')}` || '.default';
const hostName = WATCHER_MACHINE_RECORD === 'true' ? fixedHostName : '';

const sdc = new SDC({
  host: WATCHER_HOST,
  port: WATCHER_PORT,
  prefix: WATCHER_PREFIX
});

export const increment = (key, count) => {
  if (WATCHER_ENABLE === 'true') {
    sdc.increment(`${key + hostName}`, count);
  }
};

export const gauge = (key, count) => {
  if (WATCHER_ENABLE === 'true') {
    sdc.gauge(`${key + hostName}`, count);
  }
};

export const timing = (key, timer) => {
  if (WATCHER_ENABLE === 'true') {
    sdc.timing(`${key + hostName}`, timer);
  }
};
