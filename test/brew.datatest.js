
const should = require('chai').use(require('chai-as-promised')).should();

const BrewDB = require('../server/db.js');
const BrewData = require('../server/brew.data.js');


describe.skip('BrewDB', () => {

	before('Await DB', ()=>{
		return BrewDB.connect()
			.then(()=>{
				console.log('connected');
			})
			.catch(()=>{
				console.log('sdfdsfdsfdsf');
			})
	});

	it('generates ID on save', (done) => {
		console.log('getting here');
		return BrewData.create({
			text : "Brew Text"
		}).then((brew) => {
			console.log('here2');
			should.exist(brew);
			brew.should.have.property('editId').that.is.a('string');
			brew.should.have.property('shareId').that.is.a('string');
			brew.should.have.property('text').that.is.a('string');
			console.log('and I am done');
			done();
		})
		.catch((e) => {
			console.log('an error', e);
		})
	});

});