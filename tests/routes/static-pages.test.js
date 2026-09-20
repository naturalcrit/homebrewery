import supertest from 'supertest';
import createApp from '../../server/app.js';

let app;
let request;

beforeAll(async ()=>{
	app = await createApp();
	request = supertest.agent(app).set('X-Forwarded-Proto', 'https');
});

describe('Tests for static pages', ()=>{
	it('Home page works', async ()=>{
		await request.get('/').expect(200);
	});

	it('Home page legacy works', async ()=>{
		await request.get('/legacy').expect(200);
	});

	it('Changelog page works', async ()=>{
		await request.get('/changelog').expect(200);
	});

	it('FAQ page works', async ()=>{
		await request.get('/faq').expect(200);
	});

	it('robots.txt works', async ()=>{
		await request.get('/robots.txt').expect(200);
	});
});