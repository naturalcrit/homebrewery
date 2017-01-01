
module.exports = {
	connect : ()=>{
		return new Promise((resolve, reject)=>{
			require('mongoose')
				.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/homebrewery',
					(err) => {
						if(err){
							console.log('Error : Could not connect to a Mongo Database.');
							console.log('        If you are running locally, make sure mongodb.exe is running.');
							return reject();
						}
						return resolve();
					}
				);
		});
	}
}