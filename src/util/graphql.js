/* eslint import/prefer-default-export: 0 */
import { readList, readItem, createItem, updateItem, deleteItem } from './crud';

export const fetchAll = async (model, query) => {
  const { result } = await readList(model, query);
  return result;
};

export const fetchOne = async (model, id, query) => {
  const { result } = await readItem(model, id, query);
  return result;
};

export const create = async (model, attributes) => {
  const item = await createItem(model, attributes);
  return item;
};

export const update = async (model, id, attributes) => {
  const { result } = await updateItem(model, id, attributes);
  return result;
};

export const destroy = async (model, id) => {
  const { result } = await deleteItem(model, id);
  return result;
};
