import supertest from 'supertest';
import createApp from '../../server/app.js';

let app;
let request;

beforeAll(async ()=>{
	app = await createApp();
	request = supertest.agent(app).set('X-Forwarded-Proto', 'https');
});

describe('Tests for static assets and cache settings', ()=>{
	it('Test Brotli compressed CSS file', async ()=>{
		const results = await request.get('/fonts/fonts/fonts.css.br');
		expect(results.header['content-type']).toBe('application/octet-stream');
		expect(results.header['cache-control']).toBe('public, max-age: 43200, must-revalidate');
	});

	it('Test Brotli encrypted font file', async ()=>{
		const results = await request.get('/fonts/fonts/open-sans-latin-400-normal.woff2.br');
		expect(results.header['content-type']).toBe('application/octet-stream');
		expect(results.header['cache-control']).toBe('public, max-age=2592000, must-revalidate');
	});

	it('Test regular CSS file', async ()=>{
		const results = await request.get('/fonts/fonts/fonts.css');
		expect(results.header['content-type']).toBe('text/css; charset=utf-8');
		expect(results.header['cache-control']).toBe('public, max-age: 43200, must-revalidate');
	});

	it('Test regular font file', async ()=>{
		const results = await request.get('/fonts/fonts/open-sans-latin-400-normal.woff2');
		expect(results.header['content-type']).toBe('font/woff2');
		expect(results.header['cache-control']).toBe('public, max-age=2592000, must-revalidate');
	});

});