import nconf from 'nconf';

export default nconf
	.argv()
	.env({ lowerCase: true })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('development', { file: 'config/dev.json' })
	.file('defaults', { file: 'config/default.json' });