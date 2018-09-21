module.exports = {
	connect : ()=>{
		return new Promise((resolve, reject)=>{
			const mongo = require('mongoose');
			const dburl = process.env.MONGODB_URI || process.env.MONGOLAB_URI ||
				'mongodb://localhost/homebrewery';
			mongo.connect(dburl, (error)=>{
				if(error) {
					console.error('Could not connect to a MongoDB');
					return reject();
				}
				return resolve();
			});
		});
	}
};