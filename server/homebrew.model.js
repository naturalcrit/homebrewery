var mongoose = require('mongoose');
var shortid = require('shortid');

var HomebrewSchema = mongoose.Schema({
	shareId : {type : String, default: shortid.generate},
	editId : {type : String, default: shortid.generate},
	text : {type : String, default : ""},

	createdAt     : { type: Date, default: Date.now },
	updatedAt   : { type: Date}
});


//Schema Options
HomebrewSchema.pre('save', function(done) {
	this.updatedAt = new Date();
	done();
});

/*
HomebrewSchema.options.toJSON.transform = function (doc, ret, options) {
	delete ret._id;
	delete ret.__t;
	delete ret.__v;
}
HomebrewSchema.options.toObject.transform = function (doc, ret, options) {
	delete ret._id;
	delete ret.__t;
	delete ret.__v;
}
*/

var Homebrew = mongoose.model('Homebrew', HomebrewSchema);

module.exports = {
	schema : HomebrewSchema,
	model : Homebrew,
}