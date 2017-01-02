
const testing = require('./test.init.js');
const should = testing.should;


const BrewDB = require('../server/brew.data.js');


describe('BrewDB', () => {

	before('Await DB', ()=>{
		return require('db.js').connect();
	});

	it('generates ID on save', () => {
		return BrewDB.create({
			text : "Brew Text"
		}).then((brew) => {
			should.exist(brew);
			brew.should.have.property('editId').that.is.a('string');
			brew.should.have.property('shareId').that.is.a('string');
			brew.should.have.property('text').that.is.a('string');
		});
	});

});