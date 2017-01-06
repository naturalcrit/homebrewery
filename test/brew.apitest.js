const testing = require('./test.init.js');
const request = require('supertest-as-promised');

const app = require('app.js');
const BrewDB = require('db.js');


describe('/api/brew', () => {
	const apiPath = '/api/brew';

	before('Await DB', ()=>{
		return BrewDB.connect()
	});

	describe('POST', () => {
		it('creates a new brew', () => {
			return request(app)
				.post(apiPath)
				.send({
					text : 'Brew Text'
				})
				.expect(200)
				.then((res) => {
					const brew = res.body;
					//should.exist(brew);
					brew.should.have.property('editId').that.is.a('string');
					brew.should.have.property('shareId').that.is.a('string');
					brew.should.have.property('text').that.is.a('string');
				})
		});

	});


});