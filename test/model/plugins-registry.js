import importFresh from 'import-fresh';

describe('plugin::mask', () => {
  before(async () => {
    process.env.MODEL_REGISTRY = 'false';
  });

  after(async () => {
    process.env.MODEL_REGISTRY = 'false';
  });

  process.env.MODEL_REGISTRY = 'true';
  const { Model } = importFresh('../../src/util/bookshelf');
  const Person = class extends Model {
  };

  it('应该返回一个对象', () => {
    const person = new Person();
    person.should.be.instanceOf(Person);
  });
});
