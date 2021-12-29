const Mongoose = require('mongoose');

const getMongoDBURL = (config)=>{
	return config.get('mongodb_uri') ||
           config.get('mongolab_uri') ||
           'mongodb://localhost/homebrewery';
};

const disconnect = ()=>{
	return Mongoose.close();
};

const connect = (config)=>{
	const resolver = (resolve, reject)=>{
		Mongoose.connect(getMongoDBURL(config),
			{ retryWrites: false },
			(error)=>{
				if(error) {
					console.error('Could not connect to a Mongo Database.');
					console.log(error);
					console.error('If you are running locally, make sure mongodb.exe is running.');
					// FIXME: do we need to pass 'error' to 'reject'?
					return reject();
				}

				return resolve();
			});

	};

	return new Promise(resolver);
};

module.exports = {
	connect    : connect,
	disconnect : disconnect
};
