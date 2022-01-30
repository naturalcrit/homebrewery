const DB = require('./server/db.js');
const server = require('./server/app.js');

process.chdir(__dirname);

const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

DB.connect(config).then(()=>{
	// Ensure that we have successfully connected to the database
	// before launching server
	const PORT = process.env.PORT || config.get('web_port') || 8000;
	server.app.listen(PORT, ()=>{
		console.log(`server on port: ${PORT}`);
	});
});
