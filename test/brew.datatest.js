const testing = require('./test.init.js');

const BrewDB = require('db.js');
const BrewData = require('brew.data.js');


describe('BrewDB', () => {
	before('Await DB', ()=>{
		return BrewDB.connect()
	});

	it('generates ID on save', () => {
		return BrewData.create({
			text : "Brew Text"
		}).then((brew) => {
			//should.exist(brew);
			brew.should.have.property('editId').that.is.a('string');
			brew.should.have.property('shareId').that.is.a('string');
			brew.should.have.property('text').that.is.a('string');
		})

	});

});