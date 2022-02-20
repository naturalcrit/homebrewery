const supertest = require('supertest');

// We need to mock google actions to avoid accessing real servers in our tests
// (there are limits on unauthorized access)
jest.mock('googleActions.js');

// Mimic https responses to avoid being redirected all the time
const app = supertest.agent(require('app.js').app)
    .set('X-Forwarded-Proto', 'https');

const DB = require('db.js');
const Homebrew = require('homebrew.model.js');

const config = require('config.js');

describe('/source/:id', ()=>{
	beforeAll(()=>{
		return DB.connect(config);
	});

	beforeAll(async ()=>{
		const regularBrew = new Homebrew.model({
			shareId : 'share-id-1',
			text    : 'This is text',
			authors : ['this', 'is', 'list', 'of', 'authors']
		});
		await regularBrew.save();

		const brewWithSpecialSymbol = new Homebrew.model({
			shareId : 'share-id-2',
			text    : '<div>&</div>'
		});
		await brewWithSpecialSymbol.save();
	});

	it('able to return a source of an existing brew', ()=>{
		return app.get('/source/share-id-1')
            .send()
            .expect(200)
            .then((response)=>{
            	expect(response.text).toBe('<code><pre style="white-space: pre-wrap;">This is text</pre></code>');
            });
	});

	it('encodes special symbols', ()=>{
		return app.get('/source/share-id-2')
            .send()
            .expect(200)
            .then((response)=>{
            	expect(response.text).toBe('<code><pre style="white-space: pre-wrap;">&lt;div&gt;&amp;&lt;/div&gt;</pre></code>');
            });
	});

	it('sets the correct response headers', ()=>{
		return app.get('/source/share-id-1')
            .send()
            .expect(200)
            .then((response)=>{
            	expect(response.headers).toHaveProperty('content-type', 'text/html; charset=utf-8');
            });
	});

	it('returns an error for a non-existing brew', ()=>{
		return app.get('/source/invalid-id')
            .send()
            // FIXME: we should be expecting 404 Not Found (#1983)
            .expect(500);
	});

	it('returns an error for a non-existing brew (google id)', ()=>{
		return app.get('/source/non-existing-brew-id')
            .send()
            // FIXME: we should be expecting 404 Not Found (#1983)
            .expect(500);
	});

	// FIXME: we should return an error instead of a home page here
	it.skip('returns an error for a missing brew id', ()=>{
		return app.get('/source/')
            .send()
            .expect(404);
	});

	// FIXME: we should return an error instead of a home page here
	it.skip('returns an error for a missing brew id #2', ()=>{
		return app.get('/source')
            .send()
            .expect(404);
	});

	// FIXME: add tests for retrieving a Google brew source

	afterAll(()=>{
		return Homebrew.model.deleteMany();
	});

	afterAll(()=>{
		return DB.disconnect();
	});
});
