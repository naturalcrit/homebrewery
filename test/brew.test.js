const testing = require('./test.init.js');

const DB = require('db.js');
const BrewData = require('brew.data.js');
const Error = require('error.js');


let storedBrew = {
	title : 'good title',
	text : 'original text'
};

describe('Brew Data', () => {
	before('Connect DB', DB.connect);
	before('Clear DB', BrewData.removeAll);
	before('Create brew', ()=>{
		return BrewData.create(storedBrew)
			.then((brew)=>{ storedBrew = brew; });
	});

	it('generates edit/share ID on create', () => {
		return BrewData.create({
			text : 'Brew Text'
		}).then((brew) => {
			brew.should.have.property('editId').that.is.a('string');
			brew.should.have.property('shareId').that.is.a('string');
			brew.should.have.property('text').that.is.a('string');
			brew.should.have.property('views').equal(0);
		});
	});

	it('generates edit/share ID on create even if given one', () => {
		return BrewData.create({
			editId : 'NOPE',
			shareId : 'NOTTA'
		}).then((brew) => {
			brew.should.have.property('editId').not.equal('NOPE');
			brew.should.have.property('shareId').not.equal('NOTTA');
		});
	});


	it('can update an existing brew', () => {
		return BrewData.update(storedBrew.editId,{
			text : 'New Text'
		}).then((brew) => {
			brew.should.have.property('editId').equal(storedBrew.editId);
			brew.should.have.property('text').equal('New Text');
			brew.should.have.property('title').equal(storedBrew.title);
		})
	});


	it('properly returns a brew if retrieved by just share', () => {
		return BrewData.getByShare(storedBrew.shareId)
			.then((brew) => {
				brew.should.not.have.property('editId');
				brew.should.have.property('shareId').equal(storedBrew.shareId);
				brew.should.have.property('views').equal(1);
			})
	});


	it('can properly remove a brew', () => {
		return BrewData.remove(storedBrew.editId)
			.then(() => {
				return BrewData.getByEdit(storedBrew.editId)
			})
			.then(() => { throw 'Brew found when one should not have been'; })
			.catch((err) => {
				err.should.be.an.instanceof(Error.noBrew);
			});
	});

	it('throws the right error if can not find brew', () => {
		return BrewData.getByEdit('NOT A REAL ID')
			.then(() => { throw 'Brew found when one should not have been'; })
			.catch((err) => {
				err.should.be.an.instanceof(Error.noBrew);
			});
	});

	describe('Title Generation', () => {
		it('should use the title if given one', () => {
			return BrewData.create({
				title : 'Actual Title',
				text : '# Not this'
			}).then((brew) => {
				brew.should.have.property('title').equal('Actual Title');
			});
		});
		it('should use the first header found if no title provided', () => {
			return BrewData.create({
				text : 'Not this \n # But This'
			}).then((brew) => {
				brew.should.have.property('title').equal('But This');
			})
		});
		it('should use the first line if no headers are found', () => {
			return BrewData.create({
				text : 'First line \n second line'
			}).then((brew) => {
				brew.should.have.property('title').equal('First line');
			});
		});
	});

});
