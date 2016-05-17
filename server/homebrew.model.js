var mongoose = require('mongoose');
var shortid = require('shortid');
var _ = require('lodash');

var HomebrewSchema = mongoose.Schema({
	shareId : {type : String, default: shortid.generate, index: { unique: true }},
	editId : {type : String, default: shortid.generate, index: { unique: true }},
	title : {type : String, default : ""},
	text : {type : String, default : ""},

	createdAt     : { type: Date, default: Date.now },
	updatedAt   : { type: Date, default: Date.now},
	lastViewed  : { type: Date, default: Date.now},
	views : {type:Number, default:0}
});



var Homebrew = mongoose.model('Homebrew', HomebrewSchema);

module.exports = {
	schema : HomebrewSchema,
	model : Homebrew,
}