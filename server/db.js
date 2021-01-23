const Mongoose = require('mongoose');

const getMongoDBURL = ()=>{
	if(process.env.NODE_ENV === 'test' && process.env.MONGO_URL) {
		// This env variable is provided by shelfio/jest-mongodb and it should be
		// used in test environment
		return process.env.MONGO_URL;
	}

	return process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/homebrewery';
};

const connectionResolver = (resolve, reject)=>{
	Mongoose.connect(getMongoDBURL(),
		{ retryWrites: false, useNewUrlParser: true },
		(error)=>{
			if(error) {
				console.error('Could not connect to a Mongo Database.');
				console.error('If you are running locally, make sure mongodb.exe is running.');
				return reject();
			}

			return resolve();
		});
};

const disconnect = ()=>{
	return Mongoose.close();
};

const connect = ()=>{
	return new Promise(connectionResolver);
};

module.exports = {
	connect    : connect,
	disconnect : disconnect
};
