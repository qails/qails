import { envelope } from '../../src';

describe('response envelope', () => {
  it('不传数据时返回应该被信封包裹', () => {
    const data = envelope();
    data.should.have.property('code', undefined);
  });

  it('传入数据时返回应该被信封包裹', () => {
    const code = 0;
    const message = 'message';
    const result = { foo: 'bar' };
    const data = envelope({ code, message, result });
    data.should.have.property('code', 0);
    data.should.have.property('message', message);
    data.should.have.property('data', result);
  });
});
