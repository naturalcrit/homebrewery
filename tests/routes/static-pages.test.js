const supertest = require('supertest');

const start = Date.now();
console.log(`START DELAY ${Date.now().toString()}`);
while (Date.now() < start + 10000){};
console.log(`END DELAY ${Date.now().toString()}`);

// Mimic https responses to avoid being redirected all the time
const app = supertest.agent(require('app.js').app)
    .set('X-Forwarded-Proto', 'https');

describe('Tests for static pages', ()=>{
	it('Home page works', ()=>{
		return app.get('/').expect(200);
	});

	it('Home page v3 works', ()=>{
		return app.get('/v3_preview').expect(200);
	});

	it('Changelog page works', ()=>{
		return app.get('/changelog').expect(200);
	});

	it('FAQ page works', ()=>{
		return app.get('/faq').expect(200);
	});

	it('robots.txt works', ()=>{
		return app.get('/robots.txt').expect(200);
	});
});
