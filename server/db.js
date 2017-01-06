const mongoose = require('mongoose');
mongoose.Promise = Promise;

const dbPath = process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/homebrewery';

module.exports = {
	connect : ()=>{
		return new Promise((resolve, reject)=>{
			mongoose.createConnection(dbPath,
				(err) => {
					if(err){
						console.log('Error : Could not connect to a Mongo Database.');
						console.log('        If you are running locally, make sure mongodb.exe is running.');
						return reject(err);
					}
					return resolve();
				}
			);
		});
	},
	instance : mongoose,
	clearDatabase : ()=>{}
}