require('app-module-path').addPath('./server');

const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('testing', { file: `test/config.json` })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

const should = require('chai').use(require('chai-as-promised')).should();
const log = require('loglevel');
log.setLevel(config.get('log_level'));

module.exports = {
	should: should
};
