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
	authors     : [String],
	published   : { type: Boolean, default: false },

	createdAt  : { type: Date, default: Date.now },
	updatedAt  : { type: Date, default: Date.now },
	lastViewed : { type: Date, default: Date.now },
	views      : { type: Number, default: 0 },
	version    : { type: Number, default: 1 }
}, { versionKey: false });


HomebrewSchema.methods.sanatize = function(full=false){
	const brew = this.toJSON();
	delete brew._id;
	delete brew.__v;
	if(full){
		delete brew.editId;
	}
	return brew;
};

HomebrewSchema.methods.increaseView = async function(){
	this.lastViewed = new Date();
	this.views = this.views + 1;
	const text = this.text;
	this.text = undefined;
	await this.save()
	.catch((err)=>{
		return err;
	});
	this.text = text;
	return this;
};

HomebrewSchema.statics.get = function(query){
	return new Promise((resolve, reject)=>{
		Homebrew.find(query, (err, brews)=>{
			if(err || !brews.length) return reject('Can not find brew');
			if(!_.isNil(brews[0].textBin)) {			// Uncompress zipped text field
				unzipped = zlib.inflateRawSync(brews[0].textBin);
				brews[0].text = unzipped.toString();
			}
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
		Homebrew.find(query, (err, brews)=>{
			if(err) return reject('Can not find brew');
			return resolve(_.map(brews, (brew)=>{
				return brew.sanatize(!allowAccess);
			}));
		});
	});
};

const Homebrew = mongoose.model('Homebrew', HomebrewSchema);

module.exports = {
	schema : HomebrewSchema,
	model  : Homebrew,
};
