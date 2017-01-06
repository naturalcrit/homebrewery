require('app-module-path').addPath('./server');

const should = require('chai').use(require('chai-as-promised')).should();
const log = require('loglevel');
log.setLevel('trace');

module.exports = {
	should: should
};
