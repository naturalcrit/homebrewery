const _ = require('lodash');
const shortid = require('shortid');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const utils = require('./utils.js');

const BrewSchema = mongoose.Schema({
	shareId : {type : String, default: shortid.generate, index: { unique: true }},
	editId  : {type : String, default: shortid.generate, index: { unique: true }},

	text : {type : String, default : ""},

	title       : {type : String, default : ""},
	description : {type : String, default : ""},
	tags        : {type : String, default : ""},
	systems     : [String],
	authors     : [String],
	published   : {type : Boolean, default : false},

	createdAt  : { type: Date, default: Date.now },
	updatedAt  : { type: Date, default: Date.now},
	lastViewed : { type: Date, default: Date.now},
	views      : {type:Number, default:0}
}, { versionKey: false });

/*
BrewSchema.methods.sanatize = function(userName, isAdmin, getText = true){
	const brew = this.toJSON();
	delete brew._id;
	delete brew.__v;
	const isPriviledged = isAdmin || _.contains(this.authors, userName);
	if(!isPriviledged) delete brew.editId;
	if(!getText) delete brew.text;
	return brew;
};
*/
/*
BrewSchema.methods.sanatize = function(req, getText = true){
	const brew = this.toJSON();
	delete brew._id;
	delete brew.__v;
	const isPriviledged = isAdmin || _.contains(this.authors, userName);
	if(!isPriviledged) delete brew.editId;
	if(!getText) delete brew.text;
	return brew;
};

BrewSchema.methods.increaseView = function(){
	return new Promise((resolve, reject) => {
		this.lastViewed = new Date();
		this.views = this.views + 1;
		this.save((err) => {
			if(err) return reject(err);
			return resolve(this);
		});
	});
};
*/

BrewSchema.methods.increaseView = function(){
	this.views = this.views + 1;
	return this.save();
};


const Brew = mongoose.model('Brew', BrewSchema);



const BrewData = {
	schema : BrewSchema,
	model  : Brew,

	get : (query) => {
		//returns a single brew with the given query
		//Start using egads for errors
		return Brew.findOne(query).exec();
	},
	create : (brew) => {
		delete brew.shareId;
		delete brew.editId;

		if(!brew.title) brew.title = utils.getGoodBrewTitle(brew.text);
		const newBrew = new Brew(brew);

		//TODO: add error decorators to the catches
		return newBrew.save();
	},
	update : (newBrew) => {
		return Brew.findOneAndUpdate({ editId : newBrew.editId }, {
			...newBrew,
			updatedAt : Date.now()
		}, {new : true, upsert : true}).exec(); //TODO: TEST THIS that this returns a reocrd
	},
	remove : (editId) => {
		return Brew.find({ editId }).remove().exec();
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
		return Brew.get({ editId });
	},

	search : (query, req={}) => {
		//defaults with page and count
		//returns a non-text version of brews
		//assume sanatized ?
	},


};

module.exports = BrewData;