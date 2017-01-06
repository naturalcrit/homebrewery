const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

const log = require('loglevel');
log.setLevel(config.get('log_level'));

//DB
require('./server/db.js').connect();

//Server
const app = require('./server/app.js');

/*
app.use((req, res, next) => {
	log.debug('---------------------------');
	log.debug(req.method, req.path);

	if (req.params) {
		log.debug('req params', req.params);
	}
	if (req.query) {
		log.debug('req query', req.query);
	}

	next();
});
*/

const PORT = process.env.PORT || 8000;
const httpServer = app.listen(PORT, () => {
	log.info(`server on port:${PORT}`);
});