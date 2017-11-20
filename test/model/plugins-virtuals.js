import should from 'should';
import { base } from '../../src';

const fullName = 'abc';
const modelOptions = {
  virtuals: {
    fullName: () => fullName
  }
};

describe('plugin::Virtuals', () => {
  describe('禁用插件时', () => {
    const Person = base.Model.extend(modelOptions);

    it('fullName 应该是 undefined', async () => {
      should(new Person().get('fullName')).be.undefined();
    });
  });

  describe('启用插件时', () => {
    base.plugin('virtuals');
    const Person = base.Model.extend(modelOptions);

    it(`fullName 有值，且值为 ${fullName}`, async () => {
      should(new Person().get('fullName')).eql(fullName);
    });
  });
});
