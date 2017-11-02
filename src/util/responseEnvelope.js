import { isEmpty } from 'lodash';

export default (data = {}) => {
  const { code, message, result } = data;
  const json = { code };

  if (message) {
    json.message = message;
  }
  if (!isEmpty(result)) {
    json.data = result;
  }
  return json;
};
