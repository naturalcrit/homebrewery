const testing = require('./test.init.js');
const request = require('supertest-as-promised');

const config = require('nconf');

const app = require('app.js');
const DB = require('db.js');
const BrewData = require('brew.data.js');
const Error = require('error.js');


let brewA = {
	title : 'good title',
	text : 'original text',
	authors : ['your_dm']
};


describe('Admin API', ()=>{
	before('Connect DB', DB.connect);


	describe('Brew Lookup', ()=>{
		before('Clear DB', BrewData.removeAll);
		before('Create brew', ()=>{
			return BrewData.create(brewA)
				.then((brew)=>{ brewA = brew; });
		});


		it('throws an error if not admin', ()=>{
			return request(app)
				.get(`/admin/lookup/${brewA.editId}`)
				.expect(401);
		});
		it('looks up a brew based on the share id', () => {
			return request(app)
				.get(`/admin/lookup/${brewA.shareId}`)
				.set('x-homebrew-admin', config.get('admin:key'))
				.expect(200)
				.then((res) => {
					const brew = res.body;
					brew.should.have.property('editId').equal(brewA.editId);
					brew.should.have.property('shareId').equal(brewA.shareId);
					brew.should.have.property('text').equal(brewA.text);
				});
		});
		it('looks up a brew based on the edit id', () => {
			return request(app)
				.get(`/admin/lookup/${brewA.editId}`)
				.set('x-homebrew-admin', config.get('admin:key'))
				.expect(200)
				.then((res) => {
					const brew = res.body;
					brew.should.have.property('editId').equal(brewA.editId);
					brew.should.have.property('shareId').equal(brewA.shareId);
					brew.should.have.property('text').equal(brewA.text);
				});
		});
		it('looks up a brew based on a partial id', () => {
			const query = brewA.editId.substring(0, brewA.editId.length -2);
			return request(app)
				.get(`/admin/lookup/${query}`)
				.set('x-homebrew-admin', config.get('admin:key'))
				.expect(200)
				.then((res) => {
					const brew = res.body;
					brew.should.have.property('editId').equal(brewA.editId);
					brew.should.have.property('shareId').equal(brewA.shareId);
					brew.should.have.property('text').equal(brewA.text);
				});
		});
		it('throws an error if it can not find a brew', ()=>{
			return request(app)
				.get(`/admin/lookup/BADID`)
				.set('x-homebrew-admin', config.get('admin:key'))
				.expect(404);
		});
	});

	describe('Invalid Brew', ()=>{
		before('Clear DB', BrewData.removeAll);
		before('Create brew', ()=>{
			return BrewData.create(brewA)
				.then((brew)=>{ brewA = brew; });
		});
	});


});