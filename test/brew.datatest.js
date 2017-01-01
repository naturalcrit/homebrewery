
const testing = require('./test.init.js');
const should = testing.should;


const BrewDB = require('../server/brew.data.js');


describe('BrewDB', () => {

	it('generates ID on save', (done) => {
		return BrewDB.create({
			text : "Brew Text"
		}).then((brew) => {
			console.log('running?');
			should.exist(brew);
			brew.should.have.property('editId').that.is.a('string');
			brew.should.have.property('shareId').that.is.a('string');
			brew.should.have.property('text').that.is.a('string');
			done();
		})
		.catch(()=>{
			console.log('yo');
		})
	});

});