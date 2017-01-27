const Test = require('./test.init.js');
const _ = require('lodash');

const DB = require('db.js');
const BrewData = require('brew.data.js');
const BrewGen = require('./brew.gen.js');
//const Error = require('error.js');



describe('Brew Search', () => {
	before('Connect DB', DB.connect);
	before('Clear DB', BrewData.removeAll);
	before('Populate brews', ()=>{
		return BrewGen.populateDB(BrewGen.static());
	});


	describe('Searching', ()=>{
		it.skip('should return a total and a brew array', ()=>{

		});

		it('should be able to search for all brews', ()=>{
			return BrewData.search()
				.then((result) => {
					const brewCount = _.size(BrewGen.static());
					result.total.should.be.equal(brewCount);
					result.brews.length.should.be.equal(brewCount);
				})
		});
	});

	describe('Pagniation', () => {
		it.skip('should return the exact number of brews based on limit', () => {

		});

		it.skip('should return the correct pages when specified', () => {

		});

		it.skip('should return a partial list if on the last page', () => {

		});

	});

	describe('Sorting', ()=>{
		it.skip('should sort ASC', () => {

		});
		it.skip('should sort DESC', () => {

		});
		it.skip('should sort based on multiple fields', () => {

		});
	});

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



	describe('Term Search', ()=>{
		it('should search brews based on title', () => {
			return BrewData.termSearch('Charlie')
				.then((result) => {
					result.total.should.be.equal(1);
					result.brews.should.have.brews('BrewC');
				})
		});

		it('should search brews based on description', () => {
			return BrewData.termSearch('fancy')
				.then((result) => {
					result.total.should.be.equal(2);
					result.brews.should.have.brews('BrewA', 'BrewB');
				})
		});

		it('should search brews based on multiple terms', () => {
			return BrewData.termSearch('ranger 5e')
				.then((result) => {
						result.total.should.be.equal(1);
						result.brews.should.have.brews('BrewD');
					})
		});

		it('should perform an AND operation on the provided terms', () => {
			return BrewData.termSearch('Brew Delta GARBAGE')
				.then((result) => {
					result.total.should.be.equal(0);
				});
		});

		it('should search brews based on a combination of both', () => {
			return BrewData.termSearch('Brew Beta fancy')
				.then((result) => {
					result.total.should.be.equal(1);
					result.brews.should.have.brews('BrewB');
				});
		});
		it.skip('should not worry about the case of the terms', () => {

		});
	});

	describe('User Search', ()=>{
		it('should return brews just for a single user', () => {
			return BrewData.userSearch('userA')
				.then((result) => {
					result.total.should.be.equal(3);
					result.brews.should.have.brews('BrewA', 'BrewB', 'BrewC');
				});
		});
		it('should return nothing if provided a non-exsistent user', () => {
			return BrewData.userSearch('userXYZ')
				.then((result) => {
					result.total.should.be.equal(0);
				});
		});
	});
});