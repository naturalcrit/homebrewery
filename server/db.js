// The main purpose of this file is to provide an interface for database
// connection. Even though the code is quite simple and basically a tiny
// wrapper around mongoose package, it works as single point where
// database setup/config is performed and the interface provided here can be
// reused by both the main application and all tests which require database
// connection.

const Mongoose = require('mongoose');

const getMongoDBURL = (config)=>{
	return config.get('mongodb_uri') ||
           config.get('mongolab_uri') ||
		   'mongodb://127.0.0.1/homebrewery';  // changed from mongodb://localhost/homebrewery to accommodate versions 16+ of node.
};

const handleConnectionError = (error)=>{
	if(error) {
		console.error('Could not connect to a Mongo database: \n');
		console.error(error);
		console.error('\nIf you are running locally, make sure mongodb.exe is running and DB URL is configured properly');
		process.exit(1); // non-zero exit code to indicate an error
	}
};

const disconnect = async ()=>{
	return await Mongoose.disconnect();
};

const connect = async (config)=>{
	return await Mongoose.connect(getMongoDBURL(config), { retryWrites: false })
		.catch((error)=>handleConnectionError(error));
};

module.exports = {
	connect    : connect,
	disconnect : disconnect
};
