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
		published : false
	},
	BrewB : {
		title : 'BrewB',
		description : 'very fancy',
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
		description : 'test super amazing brew for 5e. Geared for Rangers.',
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
			return BrewData.search()
				.then((result) => {
					result.total.should.be.equal(_.size(brews));
					result.brews.length.should.be.equal(_.size(brews));
				})
		});
		it('should search brews based on title', () => {
			return BrewData.search('BrewC')
				.then((result) => {
					result.total.should.be.equal(1);
					result.brews.should.containSubset(ids(['BrewC']));
				})
		});

		it('should search brews based on description', () => {
			return BrewData.search('fancy')
				.then((result) => {
					result.total.should.be.equal(2);
					result.brews.should.containSubset(ids(['BrewA', 'BrewB']));
				})
		});

		it('should search brews based on multiple terms', () => {
			return BrewData.search('ranger 5e')
				.then((result) => {
						result.total.should.be.equal(1);
						result.brews.should.containSubset(ids(['BrewD']));
					})
		});

		it('should perform an AND operation on the provided terms', () => {
			return BrewData.search('BrewD GARBAGE')
				.then((result) => {
					result.total.should.be.equal(0);
				});
		});

		it('should search brews based on a combination of both', () => {
			return BrewData.search('BrewB fancy')
				.then((result) => {
					result.total.should.be.equal(1);
					result.brews.should.containSubset(ids(['BrewB']));
				});
		});

		it.skip('should be able to search for a specific system', ()=>{

		});
		it.skip('should be able to search for a specifc user', ()=>{

		});
	})

	describe('Permissions', () => {
		it.skip('should only fetch published brews', () => {

		});
		it.skip('fetched brews should not have text or editId', () => {

		});
		it.skip('if admin, fetches also non-published brews, with editid', () => {

		});
		it.skip('if author, fetches also non-published brews, with editid', ()=>{

		});
	});

	describe('Pagniation', () => {
		it.skip('should return the exact number of brews based on limit', () => {

		});

	});

	describe('Sorting', ()=>{

	});


});