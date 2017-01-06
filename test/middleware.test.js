const _ = require('lodash');
const testing = require('./test.init.js');
const request = require('supertest-as-promised');
const jwt = require('jwt-simple');

const DB = require('db.js');
const BrewData = require('brew.data.js');
const Error = require('error.js');

const config = require('nconf');
const mw = require('middleware.js');

const requestHandler = (req, res) => {
	return res.status(200).json(_.pick(req, ['brew', 'account', 'admin', 'params', 'query', 'body']));
};

const test_user = {
	username : 'cool guy'
};

describe('Middleware', () => {
	let app = undefined;
	let session_token = '';

	before('create session token', () => {
		session_token = jwt.encode(test_user, config.get('secret'));
	});
	beforeEach('setup test server', ()=>{
		app = require('express')();
		app.use(require('cookie-parser')());
	});

	describe('Account', ()=>{
		it('should get the account for a session', () => {
			app.use(mw.account);
			app.use(requestHandler)
			return request(app).get('/')
				.set('Cookie', `nc_session=${session_token}`)
				.send()
				.expect(200)
				.then((res) => {
					const req = res.body;
					req.should.have.property('account').is.a('object');
					req.account.should.have.property('username').equal(test_user.username);
				});
		});
		it('should not have an account for an invalid session', () => {
			app.use(mw.account);
			app.use(requestHandler)
			return request(app).get('/')
				.set('Cookie', `nc_session=BADSESSION`)
				.send()
				.expect(200)
				.then((res) => {
					const req = res.body;
					req.should.not.have.property('account');
				});
		});
	});


	describe('Brew', ()=>{
		let storedBrew = {
			text : 'brew brew',
			authors : [test_user.username]
		};
		before('Connect DB', DB.connect);
		before('Clear DB', BrewData.removeAll);
		before('Create brew', ()=>{
			return BrewData.create(storedBrew)
				.then((brew)=>{ storedBrew = brew; });
		});

		it('should load brew with editId params', ()=>{
			app.get('/:editId', mw.loadBrew, requestHandler);
			return request(app).get('/' + storedBrew.editId)
				.send()
				.expect(200)
				.then((res) => {
					const req = res.body;
					req.should.have.property('brew').is.a('object');
					req.brew.should.have.property('editId').equal(storedBrew.editId);
				});
		});

		it('should view brew with shareId params', ()=>{
			app.get('/:shareId', mw.viewBrew, requestHandler);
			return request(app).get('/' + storedBrew.shareId)
				.send()
				.expect(200)
				.then((res) => {
					const req = res.body;
					req.should.have.property('brew').is.a('object');
					req.brew.should.not.have.property('editId');
					req.brew.should.have.property('shareId').equal(storedBrew.shareId);
					req.brew.should.have.property('views').equal(1);
				});
		});
	});

	describe('Admin', ()=>{
		it('should detect when you use the admin key', () => {
			app.use(mw.admin);
			app.use(requestHandler)
			return request(app).get(`/?admin_key=${config.get('admin_key')}`)
				.send()
				.expect(200)
				.then((res) => {
					const req = res.body;
					req.should.have.property('admin').equal(true);
				});
		});
		it('should block you if you are not an admin', ()=>{
			app.use(mw.admin);
			app.use(mw.adminOnly);
			app.get('/', (req, res) => { return res.status(200).send(); });
			app.use(Error.expressHandler);
			return request(app).get(`/?admin_key=BADKEY`)
				.send()
				.expect(401);
		});
	});

});
