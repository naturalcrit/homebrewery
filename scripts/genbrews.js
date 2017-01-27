//Populates the DB with a bunch of brews for UI testing

const _ = require('lodash');

const DB = require('../server/db.js');
const BrewData = require('../server/brew.data.js');


//TODO: pull in snippets and randomly add them

const genBrew = () => {
	return {
		title : 'BrewA',
		description : '',
		text : '',
		authors : _.sampleSize(['userA','userB','userC','userD'], _.random(0, 3)),
		systems : _.sampleSize(['5e', '4e', '3.5e', 'Pathfinder'], _.random(0,2)),
		views   : _.random(0,1000),
		published : !!_.random(0,1)
	}
}

const randomBrews = _.times(20, genBrew);

const specificBrews = [
	{
		text : 'Cool test',
		authors : ['test']
	}
];


return Promise.resolve()
	.then(DB.connect)
	.then(BrewData.removeAll)
	.then(() => {
		console.log('Adding random brews...');
		return Promise.all(_.map(randomBrews, (brew) => {
			return BrewData.create(brew);
		}));
	})
	.then(() => {
		console.log('Adding specific brews...');
		return Promise.all(_.map(specificBrews, (brew) => {
			return BrewData.create(brew);
		}));
	})
	.then(() => {
		console.log(`\n Added ${randomBrews.length + specificBrews.length} brews.`);
	})
	.catch(console.error);
