/* eslint-disable max-lines */

import { splitTextStyleAndMetadata } from '../shared/helpers.js';

describe('Tests for api', ()=>{
	let api;
	let google;
	let model;
	let hbBrew;
	let googleBrew;
	let res;

	let modelBrew;
	let saveFunc;
	let markModifiedFunc;
	let saved;

	beforeEach(()=>{
		jest.resetModules();
		jest.restoreAllMocks();

		saved = undefined;
		saveFunc = jest.fn(async function() {
			saved = { ...this, _id: '1' };
			return saved;
		});
		markModifiedFunc = jest.fn(()=>true);

		modelBrew = (brew)=>({
			...brew,
			save         : saveFunc,
			markModified : markModifiedFunc,
			toObject     : function() {
				delete this.save;
				delete this.toObject;
				delete this.markModified;
				return this;
			}
		});

		google = require('./googleActions.js').default;
		model  = require('./homebrew.model.js').model;
		api    = require('./homebrew.api').default;

		jest.mock('./googleActions.js');
		google.authCheck = jest.fn(()=>'client');
		google.newGoogleBrew = jest.fn(()=>'id');
		google.deleteGoogleBrew = jest.fn(()=>true);

		jest.mock('./homebrew.model.js');
		model.mockImplementation((brew)=>modelBrew(brew));

		res = {
			status    : jest.fn(()=>res),
			send      : jest.fn(()=>{}),
			set       : jest.fn(()=>{}),
			setHeader : jest.fn(()=>{})
		};

		hbBrew = {
			text        : `brew text`,
			style       : 'hello yes i am css',
			title       : 'some title',
			description : 'this is a description',
			tags        : ['something', 'fun'],
			systems     : ['D&D 5e'],
			lang        : 'en',
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
			textBin     : '',
			views       : 0
		};
		googleBrew = {
			...hbBrew,
			googleId : '12345'
		};
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

		it('should throw if id is too short', ()=>{
			let err;
			try {
				api.getId({
					params : {
						id : 'abcd'
					}
				});
			} catch (e) {
				err = e;
			};

			expect(err).toEqual({ HBErrorCode: '11', brewId: 'abcd', message: 'Invalid ID', name: 'ID Error', status: 404 });
		});

		it('should return id and google id from request body', ()=>{
			const { id, googleId } = api.getId({
				params : {
					id : 'abcdefghijkl'
				},
				body : {
					googleId : '123456789012345678901234567890123'
				}
			});

			expect(id).toEqual('abcdefghijkl');
			expect(googleId).toEqual('123456789012345678901234567890123');
		});

		it('should throw invalid - google id right length but does not match pattern', ()=>{
			let err;
			try {
				api.getId({
					params : {
						id : 'abcdefghijkl'
					},
					body : {
						googleId : '012345678901234567890123456789012'
					}
				});
			} catch (e) {
				err = e;
			}

			expect(err).toEqual({ HBErrorCode: '12', brewId: 'abcdefghijkl', message: 'Invalid ID', name: 'Google ID Error', status: 404 });
		});

		it('should throw invalid - google id too short (32 char)', ()=>{
			let err;
			try {
				api.getId({
					params : {
						id : 'abcdefghijkl'
					},
					body : {
						googleId : '12345678901234567890123456789012'
					}
				});
			} catch (e) {
				err = e;
			}

			expect(err).toEqual({ HBErrorCode: '12', brewId: 'abcdefghijkl', message: 'Invalid ID', name: 'Google ID Error', status: 404 });
		});

		it('should throw invalid - google id too long (45 char)', ()=>{
			let err;
			try {
				api.getId({
					params : {
						id : 'abcdefghijkl'
					},
					body : {
						googleId : '123456789012345678901234567890123456789012345'
					}
				});
			} catch (e) {
				err = e;
			}

			expect(err).toEqual({ HBErrorCode: '12', brewId: 'abcdefghijkl', message: 'Invalid ID', name: 'Google ID Error', status: 404 });
		});

		it('should return 12-char id and google id from params', ()=>{
			const { id, googleId } = api.getId({
				params : {
					id : '123456789012345678901234567890123abcdefghijkl'
				}
			});

			expect(googleId).toEqual('123456789012345678901234567890123');
			expect(id).toEqual('abcdefghijkl');
		});

		it('should return 10-char id and google id from params', ()=>{
			const { id, googleId } = api.getId({
				params : {
					id : '123456789012345678901234567890123abcdefghij'
				}
			});

			expect(googleId).toEqual('123456789012345678901234567890123');
			expect(id).toEqual('abcdefghij');
		});
	});

	describe('getBrew', ()=>{
		const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
		const notFoundError = { HBErrorCode: '05', message: 'Brew not found', name: 'BrewLoad Error', status: 404, accessType: 'share', brewId: '1' };

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
			const testBrew = { title: 'test brew', authors: [], tags: '' };
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise(testBrew));

			const fn = api.getBrew('share', true);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);

			expect(req.brew.tags).toEqual([]);
			expect(next).toHaveBeenCalled();
		});

		it('throws if not logged in as author', async ()=>{
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

			expect(err).toEqual({ HBErrorCode: '04', message: 'User is not logged in', name: 'Access Error', status: 401, brewTitle: 'test brew', authors: ['a'] });
		});

		it('throws if logged in as invalid author', async ()=>{
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise({ title: 'test brew', authors: ['a'] }));

			const fn = api.getBrew('edit', true);
			const req = { brew: {}, account: { username: 'b' } };

			let err;
			try {
				await fn(req, null, null);
			} catch (e) {
				err = e;
			}

			expect(err).toEqual({ HBErrorCode: '03', message: 'User is not an Author', name: 'Access Error', status: 401, brewTitle: 'test brew', authors: ['a'] });
		});

		it('does not throw if no authors', async ()=>{
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise({ title: 'test brew', authors: [] }));

			const fn = api.getBrew('edit', true);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);

			expect(next).toHaveBeenCalled();
			expect(req.brew.title).toEqual('test brew');
			expect(req.brew.authors).toEqual([]);
		});

		it('does not throw if valid author', async ()=>{
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise({ title: 'test brew', authors: ['a'] }));

			const fn = api.getBrew('edit', true);
			const req = { brew: {}, account: { username: 'a' } };
			const next = jest.fn();
			await fn(req, null, next);

			expect(next).toHaveBeenCalled();
			expect(req.brew.title).toEqual('test brew');
			expect(req.brew.authors).toEqual(['a']);
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
				editId      : undefined,
				pageCount   : 1,
				published   : false,
				renderer    : 'legacy',
				lang        : 'en',
				shareId     : undefined,
				systems     : [],
				tags        : [],
				theme       : '5ePHB',
				thumbnail   : '',
				textBin     : undefined,
				version     : undefined,
				createdAt   : undefined,
				gDrive      : false,
				style       : undefined,
				trashed     : false,
				updatedAt   : undefined,
				views       : 0
			});
			expect(next).toHaveBeenCalled();
			expect(api.getId).toHaveBeenCalledWith(req);
			expect(model.get).toHaveBeenCalledWith({ shareId: '1' });
			expect(google.getGoogleBrew).toHaveBeenCalledWith(undefined, '2', '1', 'share');
		});

		it('access is denied to a locked brew', async()=>{
			const lockBrew = { title: 'test brew', shareId: '1', lock: { code: 404, shareMessage: 'brew locked' } };
			model.get = jest.fn(()=>toBrewPromise(lockBrew));
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));

			const fn = api.getBrew('share', false);
			const req = { brew: {} };
			const next = jest.fn();

			await expect(fn(req, null, next)).rejects.toEqual({ 'HBErrorCode': '51', 'brewId': '1', 'brewTitle': 'test brew', 'code': 404, 'message': 'brew locked' });
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
			expect(result.renderer).toBe('v3');
			expect(result.pageCount).toBe(1);
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

		it('does not override the title if present', ()=>{
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
				createdAt   : undefined,
				description : '',
				editId      : expect.any(String),
				gDrive      : false,
				pageCount   : 1,
				published   : false,
				renderer    : 'V3',
				lang        : 'en',
				shareId     : expect.any(String),
				style       : undefined,
				systems     : [],
				tags        : [],
				text        : undefined,
				textBin     : expect.objectContaining({}),
				theme       : '5ePHB',
				thumbnail   : '',
				title       : 'asdf',
				trashed     : false,
				updatedAt   : undefined,
				views       : 0
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
			saveFunc = jest.fn(async function() {
				throw 'err';
			});
			model.mockImplementation((brew)=>modelBrew(brew));

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
				createdAt   : undefined,
				description : '',
				editId      : expect.any(String),
				gDrive      : false,
				pageCount   : 1,
				published   : false,
				renderer    : 'V3',
				lang        : 'en',
				shareId     : expect.any(String),
				googleId    : expect.any(String),
				style       : undefined,
				systems     : [],
				tags        : [],
				text        : undefined,
				textBin     : undefined,
				theme       : '5ePHB',
				thumbnail   : '',
				title       : 'asdf',
				trashed     : false,
				updatedAt   : undefined,
				views       : 0
			});
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

	describe('Theme bundle', ()=>{
		it('should return Theme Bundle for a User Theme', async ()=>{
			const brews = {
				userThemeAID : { title: 'User Theme A', renderer: 'V3', theme: null, shareId: 'userThemeAID', style: 'User Theme A Style', tags: ['meta:theme'], authors: ['authorName'] }
			};

			const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
			model.get = jest.fn((getParams)=>toBrewPromise(brews[getParams.shareId]));
			const req = { params: { renderer: 'V3', id: 'userThemeAID' }, get: ()=>{ return 'localhost'; }, protocol: 'https' };

			await api.getThemeBundle(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith({
				name     : 'User Theme A',
				author   : 'authorName',
				styles   : ['/* From Brew: https://localhost/share/userThemeAID */\n\nUser Theme A Style'],
				snippets : []
			});
		});

		it('should return Theme Bundle for nested User Themes', async ()=>{
			const brews = {
				userThemeAID : { title: 'User Theme A', renderer: 'V3', theme: 'userThemeBID', shareId: 'userThemeAID', style: 'User Theme A Style', tags: ['meta:theme'], authors: ['authorName'] },
				userThemeBID : { title: 'User Theme B', renderer: 'V3', theme: 'userThemeCID', shareId: 'userThemeBID', style: 'User Theme B Style', tags: ['meta:theme'], authors: ['authorName'] },
				userThemeCID : { title: 'User Theme C', renderer: 'V3', theme: null, shareId: 'userThemeCID', style: 'User Theme C Style', tags: ['meta:theme'], authors: ['authorName'] }
			};

			const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
			model.get = jest.fn((getParams)=>toBrewPromise(brews[getParams.shareId]));
			const req = { params: { renderer: 'V3', id: 'userThemeAID' }, get: ()=>{ return 'localhost'; }, protocol: 'https' };

			await api.getThemeBundle(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith({
				name   : 'User Theme A',
				author : 'authorName',
				styles : [
					'/* From Brew: https://localhost/share/userThemeCID */\n\nUser Theme C Style',
					'/* From Brew: https://localhost/share/userThemeBID */\n\nUser Theme B Style',
					'/* From Brew: https://localhost/share/userThemeAID */\n\nUser Theme A Style'
				],
				snippets : []
			});
		});

		it('should return Theme Bundle for a Static Theme', async ()=>{
			const req = { params: { renderer: 'V3', id: '5ePHB' }, get: ()=>{ return 'localhost'; }, protocol: 'https' };

			await api.getThemeBundle(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith({
				name   : '5ePHB',
				author : undefined,
				styles : [
					`/* From Theme Blank */\n\n@import url("/themes/V3/Blank/style.css");`,
					`/* From Theme 5ePHB */\n\n@import url("/themes/V3/5ePHB/style.css");`
				],
				snippets : [
					'V3_Blank',
					'V3_5ePHB'
				]
			});
		});

		it('should return Theme Bundle for nested User and Static Themes together', async ()=>{
			const brews = {
				userThemeAID : { title: 'User Theme A', renderer: 'V3', theme: 'userThemeBID', shareId: 'userThemeAID', style: 'User Theme A Style', tags: ['meta:theme'], authors: ['authorName'] },
				userThemeBID : { title: 'User Theme B', renderer: 'V3', theme: 'userThemeCID', shareId: 'userThemeBID', style: 'User Theme B Style', tags: ['meta:theme'], authors: ['authorName'] },
				userThemeCID : { title: 'User Theme C', renderer: 'V3', theme: '5eDMG', shareId: 'userThemeCID', style: 'User Theme C Style', tags: ['meta:theme'], authors: ['authorName'] }
			};

			const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
			model.get = jest.fn((getParams)=>toBrewPromise(brews[getParams.shareId]));
			const req = { params: { renderer: 'V3', id: 'userThemeAID' }, get: ()=>{ return 'localhost'; }, protocol: 'https' };

			await api.getThemeBundle(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith({
				name   : 'User Theme A',
				author : 'authorName',
				styles : [
					`/* From Theme Blank */\n\n@import url("/themes/V3/Blank/style.css");`,
					`/* From Theme 5ePHB */\n\n@import url("/themes/V3/5ePHB/style.css");`,
					`/* From Theme 5eDMG */\n\n@import url("/themes/V3/5eDMG/style.css");`,
					'/* From Brew: https://localhost/share/userThemeCID */\n\nUser Theme C Style',
					'/* From Brew: https://localhost/share/userThemeBID */\n\nUser Theme B Style',
					'/* From Brew: https://localhost/share/userThemeAID */\n\nUser Theme A Style'
				],
				snippets : [
					'V3_Blank',
					'V3_5ePHB',
					'V3_5eDMG'
				]
			});
		});

		it('should fail for a missing Theme in the chain', async()=>{
			const brews = {
				userThemeAID : { title: 'User Theme A', renderer: 'V3', theme: 'missingTheme', shareId: 'userThemeAID', style: 'User Theme A Style', tags: ['meta:theme'], authors: ['authorName'] },
			};

			const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
			model.get = jest.fn((getParams)=>toBrewPromise(brews[getParams.shareId]));
			const req = { params: { renderer: 'V3', id: 'userThemeAID' }, get: ()=>{ return 'localhost'; }, protocol: 'https' };

			let err;
			await api.getThemeBundle(req, res)
			.catch((e)=>err = e);

			expect(err).toEqual({
				HBErrorCode : '09',
				accessType  : 'share',
				brewId      : 'missingTheme',
				message     : 'Theme Not Found',
				name        : 'ThemeLoad Error',
				status      : 404 });
		});

		it('should fail for a User Theme not tagged with meta:theme', async ()=>{
			const brews = {
				userThemeAID : { title: 'User Theme A', renderer: 'V3', theme: null, shareId: 'userThemeAID', style: 'User Theme A Style' }
			};

			const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
			model.get = jest.fn((getParams)=>toBrewPromise(brews[getParams.shareId]));
			const req = { params: { renderer: 'V3', id: 'userThemeAID' }, get: ()=>{ return 'localhost'; }, protocol: 'https' };

			let err;
			await api.getThemeBundle(req, res)
			.catch((e)=>err = e);

			expect(err).toEqual({
				HBErrorCode : '10',
				brewId      : 'userThemeAID',
				message     : 'Selected theme does not have the meta:theme tag',
				name        : 'Invalid Theme Selected',
				status      : 422 });
		});
	});

	describe('deleteBrew', ()=>{
		it('should handle case where fetching the brew returns an error', async ()=>{
			api.getBrew = jest.fn(()=>async ()=>{ throw { message: 'err', HBErrorCode: '02' }; });
			api.getId = jest.fn(()=>({ id: '1', googleId: '2' }));
			model.deleteOne = jest.fn(async ()=>{});
			const next = jest.fn(()=>{});

			await api.deleteBrew(null, null, next);

			expect(next).toHaveBeenCalled();
			expect(model.deleteOne).toHaveBeenCalledWith({ editId: '1' });
		});

		it('should delete if no authors', async ()=>{
			const brew = {
				...hbBrew,
				authors : []
			};
			api.getBrew = jest.fn(()=>async (req)=>{
				req.brew = brew;
			});
			model.findOne = jest.fn(async ()=>modelBrew(brew));
			model.deleteOne = jest.fn(async ()=>{});
			const req = {};

			await api.deleteBrew(req, res);

			expect(api.getBrew).toHaveBeenCalled();
			expect(model.findOne).toHaveBeenCalled();
			expect(model.deleteOne).toHaveBeenCalled();
		});

		it('should throw on delete error', async ()=>{
			const brew = {
				...hbBrew,
				authors : []
			};
			api.getBrew = jest.fn(()=>async (req)=>{
				req.brew = brew;
			});
			model.findOne = jest.fn(async ()=>modelBrew(brew));
			model.deleteOne = jest.fn(async ()=>{ throw 'err'; });
			const req = {};

			let err;
			try {
				await api.deleteBrew(req, res);
			} catch (e) {
				err = e;
			}

			expect(err).not.toBeUndefined();
			expect(api.getBrew).toHaveBeenCalled();
			expect(model.findOne).toHaveBeenCalled();
			expect(model.deleteOne).toHaveBeenCalled();
		});

		it('should delete when one author', async ()=>{
			const brew = {
				...hbBrew,
				authors : ['test']
			};
			api.getBrew = jest.fn(()=>async (req)=>{
				req.brew = brew;
			});
			model.findOne = jest.fn(async ()=>modelBrew(brew));
			model.deleteOne = jest.fn(async ()=>{});
			const req = { account: { username: 'test' } };

			await api.deleteBrew(req, res);

			expect(api.getBrew).toHaveBeenCalled();
			expect(model.findOne).toHaveBeenCalled();
			expect(model.deleteOne).toHaveBeenCalled();
		});

		it('should remove one author when multiple present', async ()=>{
			const brew = {
				...hbBrew,
				authors : ['test', 'test2']
			};
			api.getBrew = jest.fn(()=>async (req)=>{
				req.brew = brew;
			});
			model.findOne = jest.fn(async ()=>modelBrew(brew));
			model.deleteOne = jest.fn(async ()=>{});
			const req = { account: { username: 'test' } };

			await api.deleteBrew(req, res);

			expect(api.getBrew).toHaveBeenCalled();
			expect(markModifiedFunc).toHaveBeenCalled();
			expect(model.findOne).toHaveBeenCalled();
			expect(model.deleteOne).not.toHaveBeenCalled();
			expect(saveFunc).toHaveBeenCalled();
			expect(saved.authors).toEqual(['test2']);
		});

		it('should handle save error', async ()=>{
			const brew = {
				...hbBrew,
				authors : ['test', 'test2']
			};
			api.getBrew = jest.fn(()=>async (req)=>{
				req.brew = brew;
			});
			model.findOne = jest.fn(async ()=>modelBrew(brew));
			model.deleteOne = jest.fn(async ()=>{});
			saveFunc = jest.fn(async ()=>{ throw 'err'; });
			const req = { account: { username: 'test' } };

			let err;
			try {
				await api.deleteBrew(req, res);
			} catch (e) {
				err = e;
			}

			expect(err).not.toBeUndefined();
			expect(api.getBrew).toHaveBeenCalled();
			expect(model.findOne).toHaveBeenCalled();
			expect(model.deleteOne).not.toHaveBeenCalled();
			expect(saveFunc).toHaveBeenCalled();
		});

		it('should delete google brew', async ()=>{
			const brew = {
				...googleBrew,
				authors : ['test']
			};
			api.getBrew = jest.fn(()=>async (req)=>{
				req.brew = brew;
			});
			model.findOne = jest.fn(async ()=>modelBrew(brew));
			model.deleteOne = jest.fn(async ()=>{});
			api.deleteGoogleBrew = jest.fn(async ()=>true);
			const req = { account: { username: 'test' } };

			await api.deleteBrew(req, res);

			expect(api.getBrew).toHaveBeenCalled();
			expect(model.findOne).toHaveBeenCalled();
			expect(model.deleteOne).toHaveBeenCalled();
			expect(api.deleteGoogleBrew).toHaveBeenCalled();
		});

		it('should handle google brew delete error', async ()=>{
			const brew = {
				...googleBrew,
				authors : ['test']
			};
			api.getBrew = jest.fn(()=>async (req)=>{
				req.brew = brew;
			});
			model.findOne = jest.fn(async ()=>modelBrew(brew));
			model.deleteOne = jest.fn(async ()=>{});
			api.deleteGoogleBrew = jest.fn(async ()=>{
				 throw 'err';
			});
			const req = { account: { username: 'test' } };

			await api.deleteBrew(req, res);

			expect(api.getBrew).toHaveBeenCalled();
			expect(model.findOne).toHaveBeenCalled();
			expect(model.deleteOne).toHaveBeenCalled();
			expect(api.deleteGoogleBrew).toHaveBeenCalled();
		});

		it('should delete google brew and retain stub when multiple authors and owner request deletion', async ()=>{
			const brew = {
				...googleBrew,
				authors : ['test', 'test2']
			};
			api.getBrew = jest.fn(()=>async (req)=>{
				req.brew = brew;
			});
			model.findOne = jest.fn(async ()=>modelBrew(brew));
			model.deleteOne = jest.fn(async ()=>{});
			api.deleteGoogleBrew = jest.fn(async ()=>true);
			const req = { account: { username: 'test' } };

			await api.deleteBrew(req, res);

			expect(api.getBrew).toHaveBeenCalled();
			expect(markModifiedFunc).toHaveBeenCalled();
			expect(model.findOne).toHaveBeenCalled();
			expect(model.deleteOne).not.toHaveBeenCalled();
			expect(api.deleteGoogleBrew).toHaveBeenCalled();
			expect(saveFunc).toHaveBeenCalled();
			expect(saved.authors).toEqual(['test2']);
			expect(saved.googleId).toEqual(undefined);
			expect(saved.text).toEqual(undefined);
			expect(saved.textBin).not.toEqual(undefined);
		});

		it('should retain google brew and update stub when multiple authors and extra author requests deletion', async ()=>{
			const brew = {
				...googleBrew,
				authors : ['test', 'test2']
			};
			api.getBrew = jest.fn(()=>async (req)=>{
				req.brew = brew;
			});
			model.findOne = jest.fn(async ()=>modelBrew(brew));
			model.deleteOne = jest.fn(async ()=>{});
			api.deleteGoogleBrew = jest.fn(async ()=>true);
			const req = { account: { username: 'test2' } };

			await api.deleteBrew(req, res);

			expect(api.getBrew).toHaveBeenCalled();
			expect(model.findOne).toHaveBeenCalled();
			expect(model.deleteOne).not.toHaveBeenCalled();
			expect(api.deleteGoogleBrew).not.toHaveBeenCalled();
			expect(saveFunc).toHaveBeenCalled();
			expect(saved.authors).toEqual(['test']);
			expect(saved.googleId).toEqual(brew.googleId);
		});
	});
	describe('Get CSS', ()=>{
		it('should return brew style content as CSS text', async ()=>{
			const testBrew = { title: 'test brew', text: '```css\n\nI Have a style!\n```\n\n' };

			const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise(testBrew));

			const fn = api.getBrew('share', true);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);
			await api.getCSS(req, res);

			expect(req.brew).toEqual(testBrew);
			expect(req.brew).toHaveProperty('style', '\nI Have a style!\n');
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith('\nI Have a style!\n');
			expect(res.set).toHaveBeenCalledWith({
				'Cache-Control' : 'no-cache',
				'Content-Type'  : 'text/css'
			});
		});

		it('should return 404 when brew has no style content', async ()=>{
			const testBrew = { title: 'test brew', text: 'I don\'t have a style!' };

			const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise(testBrew));

			const fn = api.getBrew('share', true);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);
			await api.getCSS(req, res);

			expect(req.brew).toEqual(testBrew);
			expect(req.brew).toHaveProperty('style');
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.send).toHaveBeenCalledWith('');
		});

		it('should return 404 when brew does not exist', async ()=>{
			const testBrew = { };

			const toBrewPromise = (brew)=>new Promise((res)=>res({ toObject: ()=>brew }));
			api.getId = jest.fn(()=>({ id: '1', googleId: undefined }));
			model.get = jest.fn(()=>toBrewPromise(testBrew));

			const fn = api.getBrew('share', true);
			const req = { brew: {} };
			const next = jest.fn();
			await fn(req, null, next);
			await api.getCSS(req, res);

			expect(req.brew).toEqual(testBrew);
			expect(req.brew).toHaveProperty('style');
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.send).toHaveBeenCalledWith('');
		});
	});
	describe('Split Text, Style, and Metadata', ()=>{

		it('basic splitting', async ()=>{
			const testBrew = {
				text : '```metadata\n' +
					'title: title\n' +
					'description: description\n' +
					'tags: [ \'tag a\' , \'tag b\' ]\n' +
					'systems: [ test system ]\n' +
					'renderer: legacy\n' +
					'theme: 5ePHB\n' +
					'lang: en\n' +
					'\n' +
					'```\n' +
					'\n' +
					'```css\n' +
					'style\n' +
					'style\n' +
					'style\n' +
					'```\n' +
					'\n' +
					'text\n'
			};

			splitTextStyleAndMetadata(testBrew);

			// Metadata
			expect(testBrew.title).toEqual('title');
			expect(testBrew.description).toEqual('description');
			expect(testBrew.tags).toEqual(['tag a', 'tag b']);
			expect(testBrew.systems).toEqual(['test system']);
			expect(testBrew.renderer).toEqual('legacy');
			expect(testBrew.theme).toEqual('5ePHB');
			expect(testBrew.lang).toEqual('en');
			// Style
			expect(testBrew.style).toEqual('style\nstyle\nstyle\n');
			// Text
			expect(testBrew.text).toEqual('text\n');
		});

		it('convert tags string to array', async ()=>{
			const testBrew = {
				text : '```metadata\n' +
					'tags: tag a\n' +
					'```\n\n'
			};

			splitTextStyleAndMetadata(testBrew);

			// Metadata
			expect(testBrew.tags).toEqual(['tag a']);
		});
	});

	describe('updateBrew', ()=>{
		it('should return error on version mismatch', async ()=>{
			const brewFromClient = { version: 1 };
			const brewFromServer = { version: 1000, text: '' };

			const req = {
				brew : brewFromServer,
				body : brewFromClient
			};

			await api.updateBrew(req, res);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.send).toHaveBeenCalledWith('{\"message\":\"The server version is out of sync with the saved brew. Please save your changes elsewhere, refresh, and try again.\"}');
		});

		it('should return error on hash mismatch', async ()=>{
			const brewFromClient = { version: 1, hash: '1234' };
			const brewFromServer = { version: 1, text: 'test' };

			const req = {
				brew : brewFromServer,
				body : brewFromClient
			};

			await api.updateBrew(req, res);

			expect(req.brew.hash).toBe('098f6bcd4621d373cade4e832627b4f6');
			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.send).toHaveBeenCalledWith('{\"message\":\"The server copy is out of sync with the saved brew. Please save your changes elsewhere, refresh, and try again.\"}');
		});

		// Commenting this one out for now, since we are no longer throwing this error while we monitor
		// it('should return error on applying patches', async ()=>{
		// 	const brewFromClient = { version: 1, hash: '098f6bcd4621d373cade4e832627b4f6', patches: 'not a valid patch string' };
		// 	const brewFromServer = { version: 1, text: 'test', title: 'Test Title', description: 'Test Description' };

		// 	const req = {
		// 		brew  : brewFromServer,
		// 		body  : brewFromClient,
		// 	};

		// 	let err;
		// 	try {
		// 		await api.updateBrew(req, res);
		// 	} catch (e) {
		// 		err = e;
		// 	}

		// 	expect(err).toEqual(Error('Invalid patch string: not a valid patch string'));
		// });

		it('should save brew, no ID', async ()=>{
			const brewFromClient = { version: 1, hash: '098f6bcd4621d373cade4e832627b4f6', patches: '' };
			const brewFromServer = { version: 1, text: 'test', title: 'Test Title', description: 'Test Description' };

			model.save = jest.fn((brew)=>{return brew;});

			const req = {
				brew  : brewFromServer,
				body  : brewFromClient,
				query : { saveToGoogle: false, removeFromGoogle: false }
			};

			await api.updateBrew(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					_id         : '1',
					description : 'Test Description',
					hash        : '098f6bcd4621d373cade4e832627b4f6',
					title       : 'Test Title',
					version     : 2
				})
			);
		});
	});
});
