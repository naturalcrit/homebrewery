const supertest = require('supertest');

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

	// FIXME: robots.txt file can't be properly loaded under testing environment,
	// most likely due to __dirname being different from what is expected
	it.skip('robots.txt works', ()=>{
		return app.get('/robots.txt').expect(200);
	});
});
