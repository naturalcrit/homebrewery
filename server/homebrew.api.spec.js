/* eslint-disable max-lines */

const modelBrew = (brew, saveFunc = async function() {
	return { ...this, _id: '1' };
})=>({
	...brew,
	save     : saveFunc,
	toObject : function() {
		delete this.save;
		delete this.toObject;
		return this;
	}
});
const modelBrewThrow = (brew)=>modelBrew(brew, async function() {
	throw 'err';
});

describe('Tests for api', ()=>{
	let api;
	let google;
	let model;
	let hbBrew;
	let googleBrew;
	let res;

	beforeEach(()=>{
		google = require('./googleActions.js');
		model = require('./homebrew.model.js').model;

		jest.mock('./googleActions.js');
		google.authCheck = jest.fn(()=>'client');
		google.newGoogleBrew = jest.fn(()=>'id');
		google.deleteGoogleBrew = jest.fn(()=>true);

		jest.mock('./homebrew.model.js');
		model.mockImplementation((brew)=>modelBrew(brew));

		res = {
			status : jest.fn(()=>res),
			send   : jest.fn(()=>{})
		};

		api = require('./homebrew.api');

		hbBrew = {
			text        : `brew text`,
			style       : 'hello yes i am css',
			title       : 'some title',
			description : 'this is a description',
			tags        : ['something', 'fun'],
			systems     : ['D&D 5e'],
			renderer    : 'v3',
			theme       : 'phb',
			published   : true,
			authors     : ['1', '2'],
			owner       : '1',
			thumbnail   : '',
			_id         : 'mongoid',
			editId      : 'abcdefg',
			shareId     : 'hijklmnop',
			views       : 1,
			lastViewed  : new Date(),
			version     : 1,
			pageCount   : 1,
			textBin     : ''
		};
		googleBrew = {
			...hbBrew,
			googleId : '12345'
		};
	});

	afterEach(()=>{
		jest.restoreAllMocks();
	});

	describe('getId', ()=>{
		it('should return only id if google id is not present', ()=>{
			const { id, googleId } = api.getId({
				params : {
					id : 'abcdefgh'
				}
			});

			expect(id).toEqual('abcdefgh');
			expect(googleId).toBeUndefined();
		});

		it('should return id and google id from request body', ()=>{
			const { id, googleId } = api.getId({
				params : {
					id : 'abcdefgh'
				},
				body : {
					googleId : '12345'
				}
			});

			expect(id).toEqual('abcdefgh');
			expect(googleId).toEqual('12345');
		});

		it('should return id and google id params', ()=>{
			const { id, googleId } = api.getId({
				params : {
					id : '123456789012abcdefghijkl'
				}
			});

			expect(id).toEqual('abcdefghijkl');
			expect(googleId).toEqual('123456789012');
		});
	});

	describe('getBrew', ()=>{
		const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
		const notFoundError = 'Brew not found in Homebrewery database or Google Drive';

		it('returns middleware', ()=>{
			const getFn = api.getBrew('share');
			expect(getFn).toBeInstanceOf(Function);
		});

		it('should fetch from mongoose', async ()=>{
			const testBrew = { title: 'test brew', authors: [] };
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise(testBrew));

			const fn = api.getBrew('share', true);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);

			expect(req.brew).toEqual(testBrew);
			expect(next).toHaveBeenCalled();
			expect(api.getId).toHaveBeenCalledWith(req);
			expect(model.get).toHaveBeenCalledWith({ shareId: '1' });
		});

		it('should handle mongoose error', async ()=>{
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>new Promise((_, rej)=>rej('Unable to find brew')));

			const fn = api.getBrew('share', false);
			const req = { brew: {} };
			const next = jest.fn();
			let err;
			try {
				await fn(req, null, next);
			} catch (e) {
				err = e;
			}

			expect(err).toEqual(notFoundError);
			expect(req.brew).toEqual({});
			expect(next).not.toHaveBeenCalled();
			expect(api.getId).toHaveBeenCalledWith(req);
			expect(model.get).toHaveBeenCalledWith({ shareId: '1' });
		});

		it('changes tags from string to array', async ()=>{
			const testBrew = { title: 'test brew', authors: [], tags: 'tag' };
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise(testBrew));

			const fn = api.getBrew('share', true);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);

			expect(req.brew.tags).toEqual([]);
			expect(next).toHaveBeenCalled();
		});

		it('throws if invalid author', async ()=>{
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise({ title: 'test brew', authors: ['a'] }));

			const fn = api.getBrew('edit', true);
			const req = { brew: {} };

			let err;
			try {
				await fn(req, null, null);
			} catch (e) {
				err = e;
			}

			expect(err).toEqual(`The current logged in user does not have editor access to this brew.

If you believe you should have access to this brew, ask the file owner to invite you as an author by opening the brew, viewing the Properties tab, and adding your username to the "invited authors" list. You can then try to access this document again.`);
		});

		it('does not throw if no authors', async ()=>{
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise({ title: 'test brew', authors: [] }));

			const fn = api.getBrew('edit', true);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);

			expect(next).toHaveBeenCalled();
		});

		it('does not throw if valid author', async ()=>{
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise({ title: 'test brew', authors: ['a'] }));

			const fn = api.getBrew('edit', true);
			const req = { brew: {}, account: { username: 'a' } };
			const next = jest.fn();
			await fn(req, null, next);

			expect(next).toHaveBeenCalled();
		});

		it('fetches google brew if needed', async()=>{
			const stubBrew = { title: 'test brew', authors: ['a'] };
			const googleBrew = { title: 'test google brew', text: 'brew text' };
			api.getId = jest.fn(()=>({ id: '1', googleId: '2' }));
			model.get = jest.fn(()=>toBrewPromise(stubBrew));
			google.getGoogleBrew = jest.fn(()=>new Promise((res)=>res(googleBrew)));

			const fn = api.getBrew('share', false);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);

			expect(req.brew).toEqual({
				title       : 'test google brew',
				authors     : ['a'],
				text        : 'brew text',
				stubbed     : true,
				description : '',
				editId      : null,
				pageCount   : 1,
				published   : true,
				renderer    : 'legacy',
				shareId     : null,
				systems     : [],
				tags        : [],
				theme       : '5ePHB',
				thumbnail   : '',
				textBin     : undefined,
				version     : undefined
			});
			expect(next).toHaveBeenCalled();
			expect(api.getId).toHaveBeenCalledWith(req);
			expect(model.get).toHaveBeenCalledWith({ shareId: '1' });
			expect(google.getGoogleBrew).toHaveBeenCalledWith('2', '1', 'share');
		});
	});

	describe('mergeBrewText', ()=>{
		it('should set metadata and no style if it is not present', ()=>{
			const result = api.mergeBrewText({
				text        : `brew`,
				title       : 'some title',
				description : 'this is a description',
				tags        : ['something', 'fun'],
				systems     : ['D&D 5e'],
				renderer    : 'v3',
				theme       : 'phb',
				googleId    : '12345'
			});

			expect(result).toEqual(`\`\`\`metadata
title: some title
description: this is a description
tags:
  - something
  - fun
systems:
  - D&D 5e
renderer: v3
theme: phb

\`\`\`

brew`);
		});

		it('should set metadata and style', ()=>{
			const result = api.mergeBrewText({
				text        : `brew`,
				style       : 'hello yes i am css',
				title       : 'some title',
				description : 'this is a description',
				tags        : ['something', 'fun'],
				systems     : ['D&D 5e'],
				renderer    : 'v3',
				theme       : 'phb',
				googleId    : '12345'
			});

			expect(result).toEqual(`\`\`\`metadata
title: some title
description: this is a description
tags:
  - something
  - fun
systems:
  - D&D 5e
renderer: v3
theme: phb

\`\`\`

\`\`\`css
hello yes i am css
\`\`\`

brew`);
		});
	});

	describe('exclusion methods', ()=>{
		it('excludePropsFromUpdate removes the correct keys', ()=>{
			const sent = Object.assign({}, googleBrew);
			const result = api.excludePropsFromUpdate(sent);

			expect(sent).toEqual(googleBrew);
			expect(result._id).toBeUndefined();
			expect(result.views).toBeUndefined();
			expect(result.lastViewed).toBeUndefined();
			expect(result.editId).toBeUndefined();
			expect(result.shareId).toBeUndefined();
			expect(result.googleId).toBeUndefined();
		});

		it('excludeGoogleProps removes the correct keys', ()=>{
			const sent = Object.assign({}, googleBrew);
			const result = api.excludeGoogleProps(sent);

			expect(sent).toEqual(googleBrew);
			expect(result.tags).toBeUndefined();
			expect(result.systems).toBeUndefined();
			expect(result.published).toBeUndefined();
			expect(result.authors).toBeUndefined();
			expect(result.owner).toBeUndefined();
			expect(result.views).toBeUndefined();
			expect(result.thumbnail).toBeUndefined();
			expect(result.version).toBeUndefined();
		});

		it('excludeStubProps removes the correct keys from the original object', ()=>{
			const sent = Object.assign({}, googleBrew);
			const result = api.excludeStubProps(sent);

			expect(sent).not.toEqual(googleBrew);
			expect(result.text).toBeUndefined();
			expect(result.textBin).toBeUndefined();
			expect(result.renderer).toBeUndefined();
			expect(result.pageCount).toBeUndefined();
		});
	});

	describe('beforeNewSave', ()=>{
		it('sets the title if none', ()=>{
			const brew = {
				...hbBrew,
				title : undefined
			};
			api.beforeNewSave({}, brew);

			expect(brew.title).toEqual('brew text');
		});

		it('does not set the title if present', ()=>{
			const brew = {
				...hbBrew,
				title : 'test'
			};
			api.beforeNewSave({}, brew);

			expect(brew.title).toEqual('test');
		});

		it('does not set authors if account missing username', ()=>{
			api.beforeNewSave({}, hbBrew);

			expect(hbBrew.authors).toEqual([]);
		});

		it('sets authors if account has username', ()=>{
			api.beforeNewSave({ username: 'hi' }, hbBrew);

			expect(hbBrew.authors).toEqual(['hi']);
		});

		it('merges brew text', ()=>{
			api.mergeBrewText = jest.fn(()=>'merged');
			api.beforeNewSave({}, hbBrew);

			expect(api.mergeBrewText).toHaveBeenCalled();
			expect(hbBrew.text).toEqual('merged');
		});
	});

	describe('newGoogleBrew', ()=>{
		it('should call the correct methods', ()=>{
			api.excludeGoogleProps = jest.fn(()=>'newBrew');

			const acct = { username: 'test' };
			const brew = { title: 'test title' };
			api.newGoogleBrew(acct, brew, res);

			expect(google.authCheck).toHaveBeenCalledWith(acct, res);
			expect(api.excludeGoogleProps).toHaveBeenCalledWith(brew);
			expect(google.newGoogleBrew).toHaveBeenCalledWith('client', 'newBrew');
		});
	});

	describe('newBrew', ()=>{
		it('should set up a default brew via Homebrew model', async ()=>{
			await api.newBrew({ body: { text: 'asdf' }, query: {}, account: { username: 'test user' } }, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith({
				   _id         : '1',
				   authors     : ['test user'],
				   description : '',
				   editId      : expect.any(String),
				   pageCount   : 1,
				   published   : false,
				   renderer    : 'V3',
				   shareId     : expect.any(String),
				   systems     : [],
				   tags        : [],
				   text        : undefined,
				   textBin     : expect.objectContaining({}),
			       theme       : '5ePHB',
				   thumbnail   : '',
				   title       : 'asdf',
			});
		});

		it('should remove edit/share/google ids', async ()=>{
			await api.newBrew({ body: { editId: '1234', shareId: '1234', googleId: '1234', text: 'asdf', title: '' }, query: {} }, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalled();
			const sent = res.send.mock.calls[0][0];
			expect(sent.editId).not.toEqual('1234');
			expect(sent.shareId).not.toEqual('1234');
			expect(sent.googleId).toBeUndefined();
		});

		it('should handle mongo error', async ()=>{
			model.mockImplementation((brew)=>modelBrewThrow(brew));

			let err;
			try {
				await api.newBrew({ body: { editId: '1234', shareId: '1234', googleId: '1234', text: 'asdf', title: '' }, query: {} }, res);
			} catch (e) {
				err = e;
			}

			expect(res.send).not.toHaveBeenCalled();
			expect(err).not.toBeUndefined();
		});

		it('should save to google if requested', async()=>{
			await api.newBrew({ body: { text: 'asdf', title: '' }, query: { saveToGoogle: true }, account: { username: 'test user' } }, res);

			expect(google.newGoogleBrew).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith({
				_id         : '1',
				authors     : ['test user'],
				description : '',
				editId      : expect.any(String),
				pageCount   : undefined,
				published   : false,
				renderer    : undefined,
				shareId     : expect.any(String),
				googleId    : expect.any(String),
				systems     : [],
				tags        : [],
				text        : undefined,
				textBin     : undefined,
				theme       : '5ePHB',
				thumbnail   : '',
				title       : 'asdf',
			});
		});

		it('should handle google error', async()=>{
			google.newGoogleBrew = jest.fn(()=>{
				throw 'err';
			});
			await api.newBrew({ body: { text: 'asdf', title: '' }, query: { saveToGoogle: true }, account: { username: 'test user' } }, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith('err');
		});
	});

	describe('deleteGoogleBrew', ()=>{
		it('should check auth and delete brew', async ()=>{
			const result = await api.deleteGoogleBrew({ username: 'test user' }, 'id', 'editId', res);

			expect(result).toBe(true);
			expect(google.authCheck).toHaveBeenCalledWith({ username: 'test user' }, expect.objectContaining({}));
			expect(google.deleteGoogleBrew).toHaveBeenCalledWith('client', 'id', 'editId');
		});
	});
});
