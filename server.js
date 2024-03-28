const DB = require('./server/db.js');
const server = require('./server/app.js');
const config = require('./server/config.js');

DB.connect(config).then(()=>{
	// Ensure that we have successfully connected to the database
	// before launching server
	const PORT = process.env.PORT || config.get('web_port') || 8000;
	server.app.listen(PORT, ()=>{
		const reset = '\x1b[0m'; // Reset to default style
		const bright = '\x1b[1m'; // Bright (bold) style
		const cyan = '\x1b[36m'; // Cyan color
		const underline = '\x1b[4m'; // Underlined style

		console.log(`\n\tserver on port: ${PORT}`);
		console.log(`\t${underline}${bright}${cyan}Open in browser: http://localhost:${PORT}${reset}`)

	});
});
