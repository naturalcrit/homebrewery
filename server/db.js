const log = require('loglevel');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const dbPath = process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/homebrewery';

module.exports = {
	connect : ()=>{
		return new Promise((resolve, reject)=>{
			if(mongoose.connection.readyState == 1){
				log.info('DB already connected');
				return resolve();
			}
			mongoose.connect(dbPath,
				(err) => {
					if(err){
						log.info('Error : Could not connect to a Mongo Database.');
						log.info('        If you are running locally, make sure mongodb.exe is running.');
						return reject(err);
					}
					log.info('DB connected.');
					return resolve();
				}
			);
		});
	},
	instance : mongoose
}