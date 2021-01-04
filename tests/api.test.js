const request = require('supertest');
const app = require('server/app.js');
const DB = require('server/db.js');
const Homebrew = require('server/homebrew.model.js');

describe('/source/:id', ()=>{
	beforeAll(()=>{
		return DB.connect();
	});

	beforeAll(()=>{
		const brew = new Homebrew.model({
			shareId : 'shareid',
			text    : 'This is text',
			authors : ['this', 'is', 'list', 'of', 'authors']
		});
		return brew.save();
	});

	test('able to get source of existing rew', ()=>{
		return request(app)
        .get('/source/shareid')
        .send()
        .expect(200)
        .then((response)=>{
        	expect(response.text).toBe('<code><pre style="white-space: pre-wrap;">This is text</pre></code>');
        	expect(response.headers).toHaveProperty('content-type', 'text/html; charset=utf-8');
        });
	});

	afterAll(()=>{
		return Homebrew.model.deleteMany();
	});

	afterAll(()=>{
		return DB.disconnect();
	});
});
