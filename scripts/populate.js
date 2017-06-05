//Populates the DB with a bunch of brews for UI testing
const _ = require('lodash');

const DB = require('../server/db.js');
const BrewData = require('../server/brew.data.js');
//const BrewGen = require('../tests/brew.gen.js');

const BrewGen = require('../shared/homebrewery/snippets/brew/brew.snippet.js');

const BREW_COUNT = 50;

return Promise.resolve()
	.then(DB.connect)
	.then(BrewData.removeAll)
	.then(() => {
		return _.reduce(_.times(BREW_COUNT, BrewGen.brewModel), (flow, model)=>{
			return flow.then(()=>BrewData.create(model))
		}, Promise.resolve());
	})
	.then(() => {
		console.log(`Added ${BREW_COUNT} brews`);
	})
	.then(() => {
		return DB.close();
	})
	.catch(console.error);
