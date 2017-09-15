export default {
  Query: {
    languages: () => new Promise(resolve => resolve(Math.random() > 0.5 ? 'C' : 'JAVA'))
  }
};
