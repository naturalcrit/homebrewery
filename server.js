import DB     from './server/db.js';
import server from './server/app.js';
import config from './server/config.js';

DB.connect(config).then(()=>{
	// Ensure that we have successfully connected to the database
	// before launching server
	const PORT = process.env.PORT || config.get('web_port') || 8000;
	server.listen(PORT, ()=>{
		const reset = '\x1b[0m'; // Reset to default style
		const bright = '\x1b[1m'; // Bright (bold) style
		const cyan = '\x1b[36m'; // Cyan color
		const underline = '\x1b[4m'; // Underlined style

		console.log(`\n\tserver started at: ${new Date().toLocaleString()}`);
		console.log(`\tserver on port: ${PORT}`);
		console.log(`\t${bright + cyan}Open in browser: ${reset}${underline + bright + cyan}http://localhost:${PORT}${reset}\n\n`);

	});
});
