const testing = require('./test.init.js');
const request = require('supertest-as-promised');
const jwt = require('jwt-simple');
const config = require('nconf');

const app = require('app.js');
const DB = require('db.js');
const BrewData = require('brew.data.js');
const Error = require('error.js');

const apiPath = '/api/brew';

let session_token;
const test_user = {
	username : 'cool guy'
};
let storedBrew = {
	title : 'good title',
	text : 'original text',
	authors : ['your_dm']
};

describe('Brew API', () => {
	before('Connect DB', DB.connect);
	before('Clear DB', BrewData.removeAll);
	before('Create session token', () => {
		session_token = jwt.encode(test_user, config.get('secret'));
	});
	before('Create brew', ()=>{
		return BrewData.create(storedBrew)
			.then((brew)=>{ storedBrew = brew; });
	});


	describe('Create', () => {
		it('creates a new brew', () => {
			return request(app)
				.post(apiPath)
				.send({ text : 'Brew Text' })
				.expect(200)
				.then((res) => {
					const brew = res.body;
					brew.should.have.property('editId').that.is.a('string');
					brew.should.have.property('shareId').that.is.a('string');
					brew.should.have.property('text').equal('Brew Text');
					brew.should.not.have.property('_id');
				});
		});

		it('creates a new brew with a session author', () => {
			return request(app)
				.post(apiPath)
				.set('Cookie', `nc_session=${session_token}`)
				.send({ text : 'Brew Text' })
				.expect(200)
				.then((res) => {
					const brew = res.body;
					brew.should.have.property('authors').include(test_user.username);
				});
		});
	});

	describe('Update', () => {
		it('updates an existing brew', () => {
			return request(app)
				.put(`${apiPath}/${storedBrew.editId}`)
				.send({ text : 'New Text' })
				.expect(200)
				.then((res) => {
					const brew = res.body;
					brew.should.have.property('editId').equal(storedBrew.editId);
					brew.should.have.property('text').equal('New Text');
					brew.should.have.property('authors').include('your_dm');
					brew.should.not.have.property('_id');
				});
		});

		it('adds the user as author', () => {
			return request(app)
				.put(`${apiPath}/${storedBrew.editId}`)
				.set('Cookie', `nc_session=${session_token}`)
				.send({ text : 'New Text' })
				.expect(200)
				.then((res) => {
					const brew = res.body;
					brew.should.have.property('authors').include(test_user.username);
					brew.should.have.property('authors').include('your_dm');
				});
		});
		it('should throw error on bad edit id', ()=>{
			return request(app)
				.put(`${apiPath}/BADEDITID`)
				.send({ text : 'New Text' })
				.expect(404)
		});
	});

	describe('Remove', () => {
		it('should removes a brew', ()=>{
			return request(app)
				.del(`${apiPath}/${storedBrew.editId}`)
				.send()
				.expect(200)
				.then(() => {
					BrewData.getByEdit(storedBrew.editId)
						.then(() => { throw 'Brew found when one should not have been'; })
						.catch((err) => {
							err.should.be.instanceof(Error.noBrew);
						})
				});
		});
	});

});