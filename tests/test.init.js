require('app-module-path').addPath('./server');

const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('testing', { file: `test/config.json` })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

const Chai = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-subset'))
	.use(require('./sample_brews.js').chaiPlugin);

const log = require('loglevel');
log.setLevel(config.get('log_level'));

const jwt = require('jwt-simple');
module.exports = {
	should: Chai.should(),
	getSessionToken : (userInfo) => {
		return jwt.encode(userInfo, config.get('jwt_secret'));
	}
};
