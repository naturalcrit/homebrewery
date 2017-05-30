const Test = require('./test.init.js');
const _ = require('lodash');
const request = require('supertest-as-promised');

const config = require('nconf');

const app = require('app.js');
const DB = require('db.js');
const BrewData = require('brew.data.js');
const SampleBrews = require('./sample_brews.js');
const Error = require('error.js');


const UserX = { username : 'userX' };
const UserA = { username : 'userA' };
let UserXToken, UserAToken;

describe('Brew API', () => {
	before('Create session token', () => {
		UserXToken = Test.getSessionToken(UserX);
		UserAToken = Test.getSessionToken(UserA);
	});

	describe('CRUD', ()=>{
		before('Connect DB', DB.connect);
		before('Clear DB', BrewData.removeAll);
		before('Populate brews', ()=>{
			return SampleBrews.populateDB(SampleBrews.static());
		});
		describe('Create', () => {
			it('creates a new brew', () => {
				return request(app)
					.post(`/api/brew`)
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
					.post(`/api/brew`)
					.set('Cookie', `nc_session=${UserXToken}`)
					.send({ text : 'Brew Text' })
					.expect(200)
					.then((res) => {
						const brew = res.body;
						brew.should.have.property('authors').include(UserX.username);
					});
			});
		});

		describe('Update', () => {
			it('updates an existing brew', () => {
				const storedBrew = SampleBrews.get('BrewA');
				return request(app)
					.put(`/api/brew/${storedBrew.editId}`)
					.send({ text : 'New Text' })
					.expect(200)
					.then((res) => {
						const brew = res.body;
						brew.should.have.property('editId').equal(storedBrew.editId);
						brew.should.have.property('text').equal('New Text');
						brew.should.have.property('authors').include(storedBrew.authors[0]);
						brew.should.not.have.property('_id');
					});
			});

			it('adds the user as author', () => {
				const storedBrew = SampleBrews.get('BrewA');
				return request(app)
					.put(`/api/brew/${storedBrew.editId}`)
					.set('Cookie', `nc_session=${UserXToken}`)
					.send({ text : 'New Text' })
					.expect(200)
					.then((res) => {
						const brew = res.body;
						brew.should.have.property('authors').include(UserX.username);
						brew.should.have.property('authors').include(storedBrew.authors[0]);
					});
			});
			it('should throw error on bad edit id', ()=>{
				const storedBrew = SampleBrews.get('BrewA');
				return request(app)
					.put(`/api/brew/BADEDITID`)
					.send({ text : 'New Text' })
					.expect(404)
			});
		});

		describe('Remove', () => {
			it('should removes a brew', ()=>{
				const storedBrew = SampleBrews.get('BrewA');
				return request(app)
					.del(`/api/brew/${storedBrew.editId}`)
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
	})


	describe('Search', () => {
		before('Connect DB', DB.connect);
		before('Clear DB', BrewData.removeAll);
		before('Populate brews', ()=>{
			return SampleBrews.populateDB(SampleBrews.static());
		});

		it('should be able to search for all published brews', ()=>{
			return request(app)
				.get(`/api/brew`)
				.query({})
				.send()
				.expect(200)
				.then((res) => {
					const result = res.body;
					result.total.should.be.equal(2);
					result.brews.should.have.brews('BrewB','BrewD');
					result.brews[0].should.not.have.property('editId');
				});
		});

		it('should be able to search for brews with given terms', ()=>{
			return request(app)
				.get(`/api/brew`)
				.query({
					terms : '5e ranger'
				})
				.send()
				.expect(200)
				.then((res) => {
					const result = res.body;
					result.total.should.be.equal(1);
					result.brews.should.have.brews('BrewD');
				});
		});
		it('should be able to sort the search', ()=>{
			return request(app)
				.get(`/api/brew`)
				.query({
					sort : { views : 1}
				})
				.send()
				.expect(200)
				.then((res) => {
					const result = res.body;
					result.total.should.be.equal(2);
					result.brews[0].should.be.brew('BrewD');
					result.brews[1].should.be.brew('BrewB');
				});
		});
		it('should use pagniation on the search', ()=>{
			return request(app)
				.get(`/api/brew`)
				.query({
					limit : 1,
					page : 1,
					sort : { views : -1}
				})
				.send()
				.expect(200)
				.then((res) => {
					const result = res.body;
					result.total.should.be.equal(2);
					result.brews[0].should.be.brew('BrewD');
				})
		});
		it('should return all brews and editIds if admin', ()=>{
			return request(app)
				.get(`/api/brew`)
				.query({})
				.set('x-homebrew-admin', config.get('admin:key'))
				.send()
				.expect(200)
				.then((res) => {
					const result = res.body;
					const brewCount = _.size(SampleBrews.static());
					result.total.should.be.equal(brewCount);
					result.brews.length.should.be.equal(brewCount);
					result.brews[0].should.have.property('editId');
				});
		});
	});

	describe('User', () => {
		before('Connect DB', DB.connect);
		before('Clear DB', BrewData.removeAll);
		before('Populate brews', ()=>{
			return SampleBrews.populateDB(SampleBrews.static());
		});

		it('should be able to query brews for a specific user', ()=>{
			return request(app)
				.get(`/api/user/userA`)
				.send()
				.expect(200)
				.then((res) => {
					const result = res.body;
					result.total.should.be.equal(1);
					result.brews.length.should.be.equal(1);
					result.brews.should.have.brews('BrewB');
					result.brews[0].should.not.have.property('editId');
				});
		});
		it('should have full access if loggedin user is queried user', ()=>{
			return request(app)
				.get(`/api/user/userA`)
				.set('Cookie', `nc_session=${UserAToken}`)
				.send()
				.expect(200)
				.then((res) => {
					const result = res.body;
					result.total.should.be.equal(3);
					result.brews.length.should.be.equal(3);
					result.brews.should.have.brews('BrewA', 'BrewB', 'BrewC');
					result.brews[0].should.have.property('editId');
				});
		});
		it('should have full access if admin', ()=>{
			return request(app)
				.get(`/api/user/userA`)
				.set('x-homebrew-admin', config.get('admin:key'))
				.send()
				.expect(200)
				.then((res) => {
					const result = res.body;
					result.total.should.be.equal(3);
					result.brews.length.should.be.equal(3);
					result.brews.should.have.brews('BrewA', 'BrewB', 'BrewC');
					result.brews[0].should.have.property('editId');
				});
		});
	});

});