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
		systems : [],
		views   : 12,
		published : true
	},
	BrewB : {
		title : 'BrewB',
		description : 'fancy',
		authors : [],
		systems : [],
		views   : 7,
		published : true
	},
	BrewC : {
		title : 'BrewC',
		description : 'test',
		authors : [],
		systems : [],
		views   : 0,
		published : false
	},
	BrewD : {
		title : 'BrewD',
		description : 'test',
		authors : [],
		systems : [],
		views   : 1,
		published : true
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


	describe('Searching', ()=>{
		it('should be able to search for all brews', ()=>{


		});
		it('should find brews based on title and/or description', () => {

			//result.count.should.be.equal(2)
			//result.brews.should.deep.include.members(ids(['BrewA', 'BrewB']);
		});

		it('should return the total number of brews and page info for query', ()=>{

		});
	})

	describe('Permissions', () => {
		it('should only fetch published brews', () => {

		});
		it('fetched brews should not have text or editId', () => {

		});
		it('if admin, fetches also non-published brews, with editid', () => {

		});
		it('if author, fetches also non-published brews, with editid', ()=>{

		});
	});

	describe('Pagniation', () => {
		it('should return the exact number of brews based on limit', () => {

		});

	});

	desscribe('Sorting', ()=>{

	});


});