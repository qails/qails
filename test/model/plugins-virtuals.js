import importFresh from 'import-fresh';
import should from 'should';

const fullName = 'abc';

describe('plugin::Virtuals', () => {
  before(() => {
    process.env.MODEL_VIRTUALS = 'false';
  });

  after(() => {
    process.env.MODEL_VIRTUALS = 'false';
  });

  describe('禁用插件时', () => {
    const { Model } = importFresh('../../src/util/bookshelf');
    const Person = class extends Model {
      get virtuals() {
        return {
          fullName: () => fullName
        };
      }
    };

    it('fullName 应该是 undefined', async () => {
      should(new Person().get('fullName')).be.undefined();
    });
  });

  describe('启用插件时', () => {
    process.env.MODEL_VIRTUALS = 'true';
    const { Model } = importFresh('../../src/util/bookshelf');
    const Person = class extends Model {
      get virtuals() {
        return {
          fullName: () => fullName
        };
      }
    };

    it(`fullName 有值，且值为 ${fullName}`, async () => {
      should(new Person().get('fullName')).eql(fullName);
    });
  });
});
