import importFresh from 'import-fresh';

describe('plugin::mask', () => {
  before(async () => {
    delete process.env.MODEL_REGISTRY;
  });

  after(async () => {
    delete process.env.MODEL_REGISTRY;
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
