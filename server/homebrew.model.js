const mongoose = require('mongoose');
const shortid = require('shortid');
const _ = require('lodash');

const HomebrewSchema = mongoose.Schema({
	shareId : { type: String, default: shortid.generate, index: { unique: true } },
	editId  : { type: String, default: shortid.generate, index: { unique: true } },
	title   : { type: String, default: '' },
	text    : { type: String, default: '' },

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


HomebrewSchema.methods.increaseView = function(){
	return new Promise((resolve, reject)=>{
		this.lastViewed = new Date();
		this.views = this.views + 1;
		this.save((err)=>{
			if(err) return reject(err);
			return resolve(this);
		});
	});
};



HomebrewSchema.statics.get = function(query){
	return new Promise((resolve, reject)=>{
		Homebrew.find(query, (err, brews)=>{
			if(err || !brews.length) return reject('Can not find brew');
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