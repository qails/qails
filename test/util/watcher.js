import should from 'should';
import { increment, timing } from '../../src';

describe('util::watcher', () => {
  describe('应该按机器名分开打点', () => {
    before(() => {
      process.env.WATCHER_RECORD_BY_MACHINE = 'true';
    });

    it('WATCHER_RECORD_BY_MACHINE应该为true', () => {
      process.env.WATCHER_RECORD_BY_MACHINE.should.eql('true');
    });
    it('increment()', () => {
      should(increment('key', 1)).be.an.undefined();
    });
    it('timing()', () => {
      should(timing('key', 1)).be.an.undefined();
    });
  });

  describe('应该将所有机器打点在一起', () => {
    before(() => {
      process.env.WATCHER_RECORD_BY_MACHINE = 'false';
    });

    it('WATCHER_RECORD_BY_MACHINE应该为false', () => {
      process.env.WATCHER_RECORD_BY_MACHINE.should.eql('false');
    });
    it('increment()', () => {
      should(increment('key', 1)).be.an.undefined();
    });
    it('timing()', () => {
      should(timing('key', 1)).be.an.undefined();
    });
  });
});
