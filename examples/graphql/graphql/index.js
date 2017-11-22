import { resolve } from 'path';
import glob from 'packing-glob';
import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas';

const resolversArray = glob('models/**/resolver.js').map(file => require(resolve(file)).default);
const typesArray = glob('models/**/schema.js').map(file => require(resolve(file)).default);

export const resolvers = mergeResolvers(resolversArray);
export const typeDefs = mergeTypes(typesArray);
