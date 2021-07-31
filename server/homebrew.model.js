const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const _ = require('lodash');
const zlib = require('zlib');

const HomebrewSchema = mongoose.Schema({
	shareId : { type: String, default: ()=>{return nanoid(12);}, index: { unique: true } },
	editId  : { type: String, default: ()=>{return nanoid(12);}, index: { unique: true } },
	title   : { type: String, default: '' },
	text    : { type: String, default: '' },
	textBin : { type: Buffer },

	description : { type: String, default: '' },
	tags        : { type: String, default: '' },
	systems     : [String],
	renderer    : { type: String, default: '' },
	authors     : [String],
	published   : { type: Boolean, default: false },

	createdAt  : { type: Date, default: Date.now },
	updatedAt  : { type: Date, default: Date.now },
	lastViewed : { type: Date, default: Date.now },
	views      : { type: Number, default: 0 },
	version    : { type: Number, default: 1 }
}, { versionKey: false });

HomebrewSchema.statics.increaseView = async function(query) {
	const brew = await Homebrew.findOne(query).exec();
	brew.lastViewed = new Date();
	brew.views = brew.views + 1;
	await brew.save()
	.catch((err)=>{
		return err;
	});
	return brew;
};

HomebrewSchema.statics.get = function(query){
	return new Promise((resolve, reject)=>{
		Homebrew.find(query, (err, brews)=>{
			if(err || !brews.length) return reject('Can not find brew');
			if(!_.isNil(brews[0].textBin)) {			// Uncompress zipped text field
				unzipped = zlib.inflateRawSync(brews[0].textBin);
				brews[0].text = unzipped.toString();
			}
			if(!brews[0].renderer)
				brews[0].renderer = 'legacy';
			return resolve(brews[0]);
		});
	});
};

HomebrewSchema.statics.getByUser = function(username, allowAccess=false){
	return new Promise((resolve, reject)=>{
		const query = { authors: username, published: true };
		if(allowAccess){
			delete query.published;
		}
		Homebrew.find(query).lean().exec((err, brews)=>{ //lean() converts results to JSObjects
			if(err) return reject('Can not find brew');
			return resolve(brews);
		});
	});
};

HomebrewSchema.statics.getByShareIds = function(shareIds, username){
	return new Promise((resolve, reject)=>{
		const query = { shareId: { $in: shareIds } };
		Homebrew.find(query, (err, brews)=>{
			if(err){ return reject(); };
			brews = _.map(brews, (brew)=>{
				if(!brew.authors.includes(username)) {
					brew.editId = '';
				};
				return brew;
			});
			return resolve(brews);
		});
	});
};

const Homebrew = mongoose.model('Homebrew', HomebrewSchema);

module.exports = {
	schema : HomebrewSchema,
	model  : Homebrew,
};
