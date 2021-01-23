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

describe('/api', ()=>{
	beforeAll(()=>{
		return DB.connect();
	});

	test('able to create a new brew without account', ()=>{
		return request(app)
      .post('/api')
      .send({
      	'title' : 'My New Brew',
      	'text'  : '# Hello, World!'
      }).expect(200).then((response)=>{
      	// The most imporant field here is editId, because it can be used to
      	// manage the hombrewery document later
      	expect(response.body).toHaveProperty('editId');
      	return expect(Homebrew.model.get({ editId: response.body.editId })).resolves.toEqual(expect.objectContaining(
      		{
      			title   : 'My New Brew',
      			text    : '# Hello, World!',
      			authors : expect.arrayContaining([])
      		}));
      });
	});

	test('ignores editId attribute', ()=>{
		return request(app)
      .post('/api')
      .send({ editId: 'fake-id', 'text': '' })
      .expect(200).then((response)=>{
      	return expect(response.body.editId).not.toBe('fake-id');
      });
	});

	test('ignores shareId attribute', ()=>{
		return request(app)
      .post('/api')
      .send({ shareId: 'fake-id', 'text': '' })
      .expect(200).then((response)=>{
      	return expect(Homebrew.model.get({ editId: response.body.editId })).resolves.toEqual(expect.not.objectContaining(
      		{ shareId: 'fake-id' }));
      });
	});

	test('ignores googleId attribute', ()=>{
		return request(app)
      .post('/api')
      .send({ googleId: 'fake-id', 'text': '' })
      .expect(200).then((response)=>{
      	return expect(Homebrew.model.get({ editId: response.body.editId })).resolves.toEqual(expect.not.objectContaining(
      		{ googleId: 'fake-id' }));
      });
	});

	test('able to autogenerate brew title', ()=>{
		return request(app)
      .post('/api')
      .send({ 'text': '# Here is the title\n' })
      .expect(200).then((response)=>{
      	return expect(Homebrew.model.get({ editId: response.body.editId })).resolves.toEqual(expect.objectContaining(
      		{
      			title : 'Here is the title'
      		}));
      });
	});

	test.skip('able to autogenerate brew title without line ending', ()=>{
		// FIXME: instead of generating "Here is the title", Homebrewery returns "# "
		// See naturalcrit/homebrewery#205
		return request(app)
      .post('/api')
      .send({ 'text': '# Here is the title' })
      .expect(200).then((response)=>{
      	return expect(Homebrew.model.get({ editId: response.body.editId })).resolves.toEqual(expect.objectContaining(
      		{
      			title : 'Here is the title'
      		}));
      });
	});

	test('able to autogenerate brew title in a document without h1', ()=>{
		return request(app)
      .post('/api')
      .send({ 'text': 'Here is the title\n' })
      .expect(200).then((response)=>{
      	return expect(Homebrew.model.get({ editId: response.body.editId })).resolves.toEqual(expect.objectContaining(
      		{
      			title : 'Here is the title'
      		}));
      });
	});

	test('able to autogenerate brew title in a document without h1 and line endings', ()=>{
		return request(app)
      .post('/api')
      .send({ 'text': 'Here is the title' })
      .expect(200).then((response)=>{
      	return expect(Homebrew.model.get({ editId: response.body.editId })).resolves.toEqual(expect.objectContaining(
      		{
      			title : 'Here is the title'
      		}));
      });
	});

	afterAll(()=>{
		return Homebrew.model.deleteMany();
	});

	afterAll(()=>{
		return DB.disconnect();
	});
});
