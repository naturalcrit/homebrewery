const testing = require('./test.init.js');
const _ = require('lodash');

const DB = require('db.js');
const BrewData = require('brew.data.js');
const Error = require('error.js');

const ids = (brewIds) => {
	return _.map(brewIds, (brewId) => {
		return { editId : brews[brewId].editId };
	});
}

const brews = {
	BrewA : {
		title : 'BrewA',
		description : 'fancy',
		authors : [],
		systems : []
	},
	BrewB : {
		title : 'BrewB',
		description : 'fancy',
		authors : [],
		systems : []
	},
	BrewC : {
		title : 'BrewC',
		description : 'test',
		authors : [],
		systems : []
	},
	BrewD : {
		title : 'BrewD',
		description : 'test',
		authors : [],
		systems : []
	}
};

describe('Brew Search', () => {
	before('Connect DB', DB.connect);
	before('Clear DB', BrewData.removeAll);
	before('Populate brews', ()=>{
		return Promise.all(_.map(brews, (brewData, id) => {
			return BrewData.create(brewData)
				.then((brew)=>{ brews[id] = brew; });
			}));
	});

	it('should find brews based on title and/or description', () => {

		return new Promise((resolve, reject) => {
			return reject()
		})
			.catch(()=>{ console.log('here1');})
			.catch(()=>{ console.log('here2');})

		return BrewData.create({
			text : 'Brew Text'
		}).then((brew) => {

});
		//result.count.should.be.equal(2)
		//result.brews.should.deep.include.members(ids(['BrewA', 'BrewB']);
	});


});