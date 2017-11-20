/**
 * crud.js到grapql接口的适配器文件
 * 主要功能是捕获异常信息并将其转换成GraphQLError
 */

/* eslint import/prefer-default-export: 0 */
import { GraphQLError } from 'graphql';
import { readList, readItem, createItem, updateItem, deleteItem } from './crud';

export const fetchList = async (model, query) => {
  try {
    const result = await readList(model, query);
    return result;
  } catch (e) {
    throw new GraphQLError(e);
  }
};

export const fetchItem = async (model, id, query) => {
  try {
    const result = await readItem(model, id, query);
    return result;
  } catch (e) {
    throw new GraphQLError(e);
  }
};

export const create = async (model, attributes) => {
  try {
    const item = await createItem(model, attributes);
    return item;
  } catch (e) {
    throw new GraphQLError(e);
  }
};

export const update = async (model, id, attributes) => {
  try {
    const result = await updateItem(model, id, attributes);
    return result;
  } catch (e) {
    throw new GraphQLError(e);
  }
};

export const destroy = async (model, id) => {
  try {
    const result = await deleteItem(model, id);
    return result;
  } catch (e) {
    throw new GraphQLError(e);
  }
};
