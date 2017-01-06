const should = require('chai').use(require('chai-as-promised')).should();

const BrewDB = require('../server/db.js');
const BrewData = require('../server/brew.data.js');


describe('BrewDB', () => {
	before('Await DB', ()=>{
		return BrewDB.connect().catch()
	});

	it('generates ID on save', () => {
		return BrewData.create({
			text : "Brew Text"
		}).then((brew) => {
			should.exist(brew);
			brew.should.have.property('editId').that.is.a('string');
			brew.should.have.property('shareId').that.is.a('string');
			brew.should.have.property('text').that.is.a('string');
		})

	});

});