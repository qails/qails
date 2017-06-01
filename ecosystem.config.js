module.exports = {
  apps: [
    {
      name: 'qails-test',
      script: './test/server.js',
      exec_interpreter: 'babel-node',
      watch: true,
      ignore_watch: ['.git', 'node_modules', 'logs']
    }
  ]
};
