const DB = require('./server/db.js');
const server = require('./server/app.js');
const config = require('./server/config.js');
const fs = require('fs');
const http = require('http');
const https = require('https');

let webServer = http.createServer(server.app);

const NODE_ENV = config.get('node_env');
if(NODE_ENV === 'local.secure') {
	const hostname = config.get('hostname') || 'localhost';
	const credentials = {
		key  : fs.readFileSync(`./config/https/${hostname}-key.pem`),
		cert : fs.readFileSync(`./config/https/${hostname}.pem`)
	};
	webServer = https.createServer(credentials, server.app);
}

DB.connect(config).then(()=>{
	// Ensure that we have successfully connected to the database
	// before launching server
	const PORT = process.env.PORT || config.get('web_port') || 8000;
	webServer.listen(PORT, ()=>{
		const reset = '\x1b[0m'; // Reset to default style
		const bright = '\x1b[1m'; // Bright (bold) style
		const cyan = '\x1b[36m'; // Cyan color
		const underline = '\x1b[4m'; // Underlined style

		console.log(`\n\tserver started at: ${new Date().toLocaleString()}`);
		console.log(`\tEnvironment: ${NODE_ENV}`);
		console.log(`\tserver on port: ${PORT}`);
		console.log(`\t${bright + cyan}Open in browser: ${reset}${underline + bright + cyan}http://localhost:${PORT}${reset}\n\n`);

	});
});
