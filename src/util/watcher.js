import { hostname } from 'os';
import SDC from 'statsd-client';

const {
  WATCHER_HOST,
  WATCHER_PORT,
  WATCHER_PREFIX
} = process.env;

const sdc = new SDC({
  host: WATCHER_HOST,
  port: WATCHER_PORT,
  prefix: WATCHER_PREFIX
});

const getHostname = () => {
  let hostName = '';
  if (process.env.WATCHER_RECORD_BY_MACHINE === 'true') {
    hostName = `.${hostname().replace('.', '_')}`;
  }
  return hostName;
};

export const increment = (key, count) => {
  sdc.increment(`${key + getHostname()}`, count);
};

// export const gauge = (key, count) => {
//   sdc.gauge(`${key + getHostname()}`, count);
// };

export const timing = (key, timer) => {
  sdc.timing(`${key + getHostname()}`, timer);
};
