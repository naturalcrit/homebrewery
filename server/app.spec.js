/* eslint-disable max-lines */

const app = require('./app.js').app;

const res = {
	_status   : 0,
	status    : jest.fn((n)=>{res._status = n; return res;}),
	_send     : '',
	send      : jest.fn((data)=>{res._send = data; return res;}),
	set       : jest.fn(()=>{}),
	setHeader : jest.fn(()=>{}),
	reset     : ()=>{ res._status = 0; res._send = ''; }
};

describe('Tests for app', ()=>{
	beforeEach(()=>{
		return res.reset();
	});

	it('get CSS from a test brew that has a style', async ()=>{
		const testBrew = { title: 'test brew', shareId: 'iAmATestBrew', text: '```css\n\nI Have a style!\n````\n\n' };

		const req =  { brew: testBrew };
		await app.getCSS(req, res);

		expect(res).toHaveProperty('_status', 200);
		expect(res).toHaveProperty('_send', '\nI Have a style!\n');
	});

	it('get CSS from a test brew that has no style', async ()=>{
		const testBrew = { title: 'test brew', shareId: 'iAmATestBrew', text: 'No style data here' };

		const req =  { brew: testBrew };
		await app.getCSS(req, res);

		expect(res).toHaveProperty('_status', 404);
		expect(res).toHaveProperty('_send', undefined);
	});

	it('get CSS from no brew', async ()=>{
		const req =  { brew: undefined };
		await app.getCSS(req, res);

		expect(res).toHaveProperty('_status', 404);
		expect(res).toHaveProperty('_send', undefined);
	});
});
