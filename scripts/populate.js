//Populates the DB with a bunch of brews for UI testing
const _ = require('lodash');

const DB = require('../server/db.js');
const BrewData = require('../server/brew.data.js');
const BrewGen = require('../test/brew.gen.js');

return Promise.resolve()
	.then(DB.connect)
	.then(BrewData.removeAll)
	.then(() => {
		console.log('Adding random brews...');
		return BrewGen.populateDB(BrewGen.random(50));
	})
	.then(() => {
		console.log('Adding specific brews...');
		return BrewGen.populateDB(BrewGen.static());
	})
	.then(() => {
		return DB.close();
	})
	.catch(console.error);
