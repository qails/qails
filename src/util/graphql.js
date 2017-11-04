/* eslint import/prefer-default-export: 0 */
import { fetchAll as all, fetchOne as one } from './fetch';

export const fetchAll = async (model, query) => {
  const { result } = await all(model, query);
  return result;
};

export const fetchOne = async (model, id, query) => {
  const { result } = await one(model, id, query);
  return result;
};
