import should from 'should';
import { increment, gauge, timing } from '../../src';

describe('util::watcher', () => {
  describe('应该按机器名分开打点', () => {
    before(() => {
      process.env.WATCHER_MACHINE_RECORD = 'true';
    });

    it('WATCHER_MACHINE_RECORD应该为true', () => {
      process.env.WATCHER_MACHINE_RECORD.should.eql('true');
    });
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

  describe('应该将所有机器打点在一起', () => {
    before(() => {
      process.env.WATCHER_MACHINE_RECORD = 'false';
    });

    it('WATCHER_MACHINE_RECORD应该为false', () => {
      process.env.WATCHER_MACHINE_RECORD.should.eql('false');
    });
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
});
