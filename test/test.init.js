
// initialize config
const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('testing', { file: `./config/testing.json` })
	.file('environment', { file: `../config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: '../config/default.json' });

// other libs
const should = require('chai').use(require('chai-as-promised')).should();



module.exports = {
	config: config,
	should: should,
	clearCache: () => {
		return new Promise((resolve, reject) => {
			return resolve();
		});
	},
};
