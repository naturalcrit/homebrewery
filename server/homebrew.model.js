const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const _ = require('lodash');
const zlib = require('zlib');

const HomebrewSchema = mongoose.Schema({
	shareId   : { type: String, default: ()=>{return nanoid(12);}, index: { unique: true } },
	editId    : { type: String, default: ()=>{return nanoid(12);}, index: { unique: true } },
	googleId  : { type: String },
	title     : { type: String, default: '' },
	text      : { type: String, default: '' },
	textBin   : { type: Buffer },
	pageCount : { type: Number, default: 1 },

	description    : { type: String, default: '' },
	tags           : [String],
	systems        : [String],
	lang           : { type: String, default: 'en' },
	renderer       : { type: String, default: '' },
	authors        : [String],
	invitedAuthors : [String],
	published      : { type: Boolean, default: false },
	thumbnail      : { type: String, default: '' },

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

HomebrewSchema.statics.get = async function(query, fields=null){
	const brew = await Homebrew.findOne(query, fields).orFail()
		.catch((error)=>{throw 'Can not find brew';});
	if(!_.isNil(brew.textBin)) {			// Uncompress zipped text field
		unzipped = zlib.inflateRawSync(brew.textBin);
		brew.text = unzipped.toString();
	}
	return brew;
};

HomebrewSchema.statics.getByUser = async function(username, allowAccess=false, fields=null){
	const query = { authors: username, published: true };
	if(allowAccess){
		delete query.published;
	}
	const brews = await Homebrew.find(query, fields).lean().exec() //lean() converts results to JSObjects
		.catch((error)=>{throw 'Can not find brews';});
	return brews;
};

const Homebrew = mongoose.model('Homebrew', HomebrewSchema);

module.exports = {
	schema : HomebrewSchema,
	model  : Homebrew,
};
