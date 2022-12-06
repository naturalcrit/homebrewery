/* eslint-disable max-lines */

describe('Tests for api', ()=>{
	let api;
	let google;
	let model;
	let hbBrew;
	let googleBrew;

	beforeEach(()=>{
		google = require('./googleActions.js');
		model = require('./homebrew.model.js').model;

		jest.mock('./googleActions.js');
		jest.mock('./homebrew.model.js');

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

			const fn = api.getBrew('share', true);
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

			expect(err).toEqual('Current logged in user does not have access to this brew.');
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

			const fn = api.getBrew('share', true);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);

			expect(req.brew).toEqual({
				title   : 'test google brew',
				authors : ['a'],
				text    : 'brew text',
				stubbed : true
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
		});

		it('excludeStubProps removes the correct keys from the original object', ()=>{
			const sent = Object.assign({}, googleBrew);
			const result = api.excludeStubProps(sent);

			expect(sent).not.toEqual(googleBrew);
			expect(result.text).toBeUndefined();
			expect(result.textBin).toBeUndefined();
			expect(result.renderer).toBeUndefined();
			expect(result.pageCount).toBeUndefined();
			expect(result.version).toBeUndefined();
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
			google.authCheck = jest.fn().mockImplementation(()=>'client');
			api.excludeGoogleProps = jest.fn(()=>'newBrew');
			google.newGoogleBrew = jest.fn(()=>'id');

			const acct = { username: 'test' };
			const brew = { title: 'test title' };
			const res = { send: jest.fn(()=>{}) };
			api.newGoogleBrew(acct, brew, res);

			expect(google.authCheck).toHaveBeenCalledWith(acct, res);
			expect(api.excludeGoogleProps).toHaveBeenCalledWith(brew);
			expect(google.newGoogleBrew).toHaveBeenCalledWith('client', 'newBrew');
		});
	});
});
