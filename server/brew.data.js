const _ = require('lodash');
const shortid = require('shortid');
const mongoose = require('./db.js').instance;

const Error = require('./error.js');
const utils = require('./utils.js');

const BrewSchema = mongoose.Schema({
	shareId : {type : String, default: shortid.generate, index: { unique: true }},
	editId  : {type : String, default: shortid.generate, index: { unique: true }},

	text : {type : String, default : ""},

	title       : {type : String, default : ""},
	description : {type : String, default : ""},
	tags        : {type : String, default : ""},
	thumbnail   : {type : String, default : ""},
	systems     : [String],
	authors     : [String],
	published   : {type : Boolean, default : false},

	createdAt  : { type: Date, default: Date.now },
	updatedAt  : { type: Date, default: Date.now},
	lastViewed : { type: Date, default: Date.now},
	views      : {type:Number, default:0},
	version    : {type: Number, default:1}
}, {
	versionKey: false,
	toJSON : {
		transform: (doc, ret, options) => {
			delete ret._id;
			return ret;
		}
	}
});

//Index these fields for fast text searching
BrewSchema.index({ title: "text", description: "text" });

BrewSchema.methods.increaseView = function(){
	this.views = this.views + 1;
	return this.save();
};


const Brew = mongoose.model('Brew', BrewSchema);
const BrewData = {
	schema : BrewSchema,
	model  : Brew,

	get : (query) => {
		return Brew.findOne(query).exec()
			.then((brew) => {
				if(!brew) throw Error.noBrew();
				return brew;
			});
	},
	create : (brew) => {
		delete brew.shareId;
		delete brew.editId;
		if(!brew.title) brew.title = utils.getGoodBrewTitle(brew.text);
		return (new Brew(brew)).save();
	},
	update : (editId, newBrew) => {
		return BrewData.get({ editId })
			.then((brew) => {
				delete newBrew.shareId;
				delete newBrew.editId;
				brew = _.merge(brew, newBrew, { updatedAt : Date.now() });

				brew.markModified('authors');
				brew.markModified('systems');
				return brew.save();
			});
	},
	remove : (editId) => {
		return Brew.find({ editId }).remove().exec();
	},
	removeAll : ()=>{
		return Brew.find({}).remove().exec();
	},

	//////// Special

	getByShare : (shareId) => {
		return BrewData.get({ shareId : shareId})
			.then((brew) => {
				brew.increaseView();
				const brewJSON = brew.toJSON();
				delete brewJSON.editId;
				return brewJSON;
			});
	},
	getByEdit : (editId) => {
		return BrewData.get({ editId });
	},
};

const BrewSearch = require('./brew.search.js')(Brew);

module.exports = _.merge(BrewData, BrewSearch);