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
		it('should return a total and a brew array', ()=>{
			return BrewData.search()
				.then((result) => {
					result.total.should.be.a('number');
					result.brews.should.be.an('array');
				})
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
		it('should return the exact number of brews based on limit', () => {
			return BrewData.search({}, {
					limit : 2
				})
				.then((result) => {
					result.total.should.be.equal(_.size(BrewGen.static()));
					result.brews.length.should.be.equal(2);
				})
		});

		it('should return the correct pages when specified', () => {
			return BrewData.search({}, {
					limit : 2,
					page : 1,
					sort : { views : 1 }
				})
				.then((result) => {
					result.brews.should.have.brews('BrewA', 'BrewB');
				})
		});

		it('should return a partial list if on the last page', () => {
			return BrewData.search({}, {
					limit : 3,
					page : 1
				})
				.then((result) => {
					result.brews.length.should.be.equal(1);
				});
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
		it('should only fetch published brews', () => {
			return BrewData.search({}, {}, false)
				.then((result) => {
					result.total.should.be.equal(2);
					result.brews.should.have.brews('BrewB', 'BrewD');
				})
		});
		it('fetched brews should not have text or editId', () => {
			return BrewData.search({}, {}, false)
				.then((result) => {
					result.brews[0].should.not.have.property('text');
					result.brews[0].should.not.have.property('editId');
				})
		});
		it('if full access, brews should have editid, but no text', () => {
			return BrewData.search({}, {}, true)
				.then((result) => {
					result.brews[0].should.not.have.property('text');
					result.brews[0].should.have.property('editId');
				})
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