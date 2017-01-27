require('app-module-path').addPath('./server');

const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('testing', { file: `test/config.json` })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

const Chai = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-subset'));

const log = require('loglevel');
log.setLevel(config.get('log_level'));

//TODO: extend should to have a brewCheck
//  eg. result.brews.should.haveBrews('BrewA', 'BrewB')
// Then can remove chai-subset

module.exports = {
	should: Chai.should()
};
