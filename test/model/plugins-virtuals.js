import should from 'should';
import { bookshelf } from '../../src';

const fullName = 'abc';
const modelOptions = {
  virtuals: {
    fullName: () => fullName
  }
};

describe('plugin::Virtuals', () => {
  describe('禁用插件时', () => {
    const Person = bookshelf.Model.extend(modelOptions);

    it('fullName 应该是 undefined', async () => {
      should(new Person().get('fullName')).be.undefined();
    });
  });

  describe('启用插件时', () => {
    bookshelf.plugin('virtuals');
    const Person = bookshelf.Model.extend(modelOptions);

    it(`fullName 有值，且值为 ${fullName}`, async () => {
      should(new Person().get('fullName')).eql(fullName);
    });
  });
});
