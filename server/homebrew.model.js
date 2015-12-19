var mongoose = require('mongoose');
var shortid = require('shortid');

var HomebrewSchema = mongoose.Schema({
	shareId : {type : String, default: shortid.generate},
	editId : {type : String, default: shortid.generate},
	text : {type : String, default : ""},

	created     : { type: Date, default: Date.now },
});


var Homebrew = mongoose.model('Homebrew', HomebrewSchema);

module.exports = {
	schema : HomebrewSchema,
	model : Homebrew,
}
