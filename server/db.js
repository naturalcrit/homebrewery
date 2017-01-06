const mongoose = require('mongoose');
mongoose.Promise = Promise;

const dbPath = process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/homebrewery';

module.exports = {
	connect : ()=>{
		return new Promise((resolve, reject)=>{
			if(mongoose.connection.readyState == 1){
				console.log('already connected');
				return resolve();
			}
			mongoose.connect(dbPath,
				(err) => {
					if(err){
						console.log('Error : Could not connect to a Mongo Database.');
						console.log('        If you are running locally, make sure mongodb.exe is running.');
						return reject(err);
					}
					console.log('mongo connected.');
					return resolve();
				}
			);
		});
	},
	instance : mongoose,
	clearDatabase : ()=>{}
}