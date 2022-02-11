const DB = require('./server/db.js');
const server = require('./server/app.js');
const config = require('./server/config.js');

DB.connect(config).then(()=>{
	// Ensure that we have successfully connected to the database
	// before launching server
	const PORT = process.env.PORT || config.get('web_port') || 8000;
	server.app.listen(PORT, ()=>{
		console.log(`server on port: ${PORT}`);
	});
});
