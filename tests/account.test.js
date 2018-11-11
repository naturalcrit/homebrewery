const test = require('pico-check');
const server = require('../server.js');
const request = require('supertest');


test('Clear database', ()=>{
	require('../server/database.js').connect_and_clear();
});

const basicURLCheck = function(url, t){
	return request(server)
		.get(url)
		.expect(200)
		.then(()=>{t.pass();});
};

test.group('User is not logged in yet', (test)=>{
	test('Able to get login page', (t)=>{
		return basicURLCheck('/login', t);
	});

	test('Able to get register page', (t)=>{
		return basicURLCheck('/register', t);
	});

	test('Unable to get account page', (t)=>{
		return request(server)
		// FIXME: why the second '/' is needed in account URL?
		// Current behavior: '/account' is redirected into '/account/'
		// Expected behaviour: '/account' is redirected into '/login'
			.get('/account/')
			.expect(302)
			.expect('Location', '/login')
			.then(()=>{
				t.pass();
			});
	});

	test('Able to register', (t)=>{
		return request(server)
			.post('/register')
			.type('form')
			.send({ username: 'testuser1', password: '123456' })
			.expect(302)
			.expect('Location', '/login')
			.then(()=>{t.pass();});
	});

	test('Unable to register without password', (t)=>{
		return request(server)
			.post('/register')
			.type('form')
			.field('username', 'testuser2')
			.expect(302)
			.expect('Location', '/register')
			.then(()=>{t.pass();});
	});
	test('Unable to register without username', (t)=>{
		return request(server)
			.post('/register')
			.type('form')
			.field('password', '123456')
			.expect(302)
			.expect('Location', '/register')
			.then(()=>{t.pass();});
	});

	test('Unable to register with the same username', (t)=>{
		return request(server)
			.post('/register')
			.type('form')
			.field('username', 'testuser1')
			.field('password', '123456')
			.expect(302)
			.expect('Location', '/register')
			.then(()=>{t.pass();});
	});
});

// TODO: tests for logged users

module.exports = test;
