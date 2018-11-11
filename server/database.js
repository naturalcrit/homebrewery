const mongoose = require('mongoose');

const Connect = function(callback = null){
	return new Promise((resolve, reject)=>{
		const rawDBurl = process.env.MONGODB_URI || process.env.MONGOLAB_URI ||
            'mongodb://localhost/test_homebrewery';
		const DBurl = rawDBurl.trim();
		console.debug(`Trying to connect to the database at "${DBurl}"`);
		mongoose.connect(DBurl, (error)=>{
			if(error) {
				console.error('Could not connect to a MongoDB');
				console.error(error);
				return reject();
			}
			if(callback)
				callback();
			return resolve();
		});
	});
};

module.exports = {
	connect           : ()=>{ return Connect(); },
	connect_and_clear : ()=>{
		return Connect(function(){
			mongoose.connection.db.dropDatabase();
		});
	}
};