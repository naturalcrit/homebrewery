const testing = require('./test.init.js');
const request = require('supertest-as-promised');


const app = require('../server.js')


const apiPath = '/api/brew';

describe('/api/brew', () => {

	before('Await DB', ()=>{
		return require('db.js').connect();
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
					console.log(res.body);
				});
		});

	});


});