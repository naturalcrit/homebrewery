const path = require('path');

module.exports = require('nconf')
    .argv()
    .env({ lowerCase: true })
    .file('environment', { file: path.resolve(__dirname, '../config/${process.env.NODE_ENV}.json') })
    .file('default', { file: path.resolve(__dirname, '../config/default.json') });
