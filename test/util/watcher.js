import should from 'should';
import { increment, gauge, timing } from '../../src';

describe('watcher', () => {
  it('increment()', () => {
    should(increment('key', 1)).be.an.undefined();
  });
  it('gauge()', () => {
    should(gauge('key', 1)).be.an.undefined();
  });
  it('timing()', () => {
    should(timing('key', 1)).be.an.undefined();
  });
});
