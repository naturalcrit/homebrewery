var mongoose = require('mongoose');
var shortid = require('shortid');
var _ = require('lodash');

var HomebrewSchema = mongoose.Schema({
	shareId : {type : String, default: shortid.generate, index: { unique: true }},
	editId : {type : String, default: shortid.generate, index: { unique: true }},
	title : {type : String, default : ""},
	text : {type : String, default : ""},

	description : {type : String, default : ""},
	tags : {type : String, default : ""},
	systems : [String],
	authors : [String],
	published : {type : Boolean, default : false},

	createdAt     : { type: Date, default: Date.now },
	updatedAt   : { type: Date, default: Date.now},
	lastViewed  : { type: Date, default: Date.now},
	views : {type:Number, default:0}
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
	return new Promise((resolve, reject) => {
		this.lastViewed = new Date();
		this.views = this.views + 1;
		this.save((err) => {
			if(err) return reject(err);
			return resolve(this);
		});
	});
};



HomebrewSchema.statics.get = function(query){
	return new Promise((resolve, reject) => {
		Homebrew.find(query, (err, brews)=>{
			if(err || !brews.length) return reject('Can not find brew');
			return resolve(brews[0]);
		});
	});
};


var Homebrew = mongoose.model('Homebrew', HomebrewSchema);

module.exports = {
	schema : HomebrewSchema,
	model : Homebrew,
}