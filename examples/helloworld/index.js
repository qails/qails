const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./server');

module.exports = app;
