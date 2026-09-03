import mongoose   from 'mongoose';
import { nanoid } from 'nanoid';
import _          from 'lodash';
import zlib       from 'zlib';


const HomebrewSchema = mongoose.Schema({
	shareId   : { type: String, default: ()=>{return nanoid(12);}, index: { unique: true } },
	editId    : { type: String, default: ()=>{return nanoid(12);}, index: { unique: true } },
	googleId  : { type: String, index: true },
	title     : { type: String, default: '', index: true },
	text      : { type: String, default: '' },
	textBin   : { type: Buffer },
	pageCount : { type: Number, default: 1, index: true },

	description    : { type: String, default: '' },
	tags           : { type: [String], index: true },
	systems   		   : { type: [String], default: undefined },
	lang           : { type: String, default: 'en', index: true },
	renderer       : { type: String, default: '', index: true },
	authors        : { type: [String], index: true },
	invitedAuthors : [String],
	published      : { type: Boolean, default: false, index: true },
	thumbnail      : { type: String, default: '', index: true },

	createdAt  : { type: Date, default: Date.now, index: true },
	updatedAt  : { type: Date, default: Date.now, index: true },
	lastViewed : { type: Date, default: Date.now, index: true },
	views      : { type: Number, default: 0 },
	version    : { type: Number, default: 1, index: true },

	pinned : { type: [String], default: [], index: true },

	lock : { type: Object, index: true }
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

// STATIC FUNCTIONS

HomebrewSchema.statics.get = async function(query, fields=null){
	const brew = await Homebrew.findOne(query, fields).orFail()
		.catch((error)=>{throw 'Can not find brew';});
	if(!_.isNil(brew.textBin)) {			// Uncompress zipped text field
		const unzipped = zlib.inflateRawSync(brew.textBin);
		brew.text = unzipped.toString();
	}
	return brew;
};

HomebrewSchema.statics.getByUser = async function(username, allowAccess=false, fields=null, filter=null){
	const query = { authors: username, published: true, ...filter };
	if(allowAccess){
		delete query.published;
	}
	const brews = await Homebrew.find(query, fields).lean().exec() //lean() converts results to JSObjects
		.catch((error)=>{throw 'Can not find brews';});
	return brews;
};

HomebrewSchema.statics.getUserPinnedThemes = async function(username) {
	const fields = [
		'title',
		'shareId',
		'thumbnail',
		'authors',
		'renderer'
	];

	const filter =  {
		tags : {
			$in : [
				'meta:theme',
				'meta:Theme'
			]
		},
		pinnedByUsers : {
			$in : [
				username
			] }
	};
	const query = { authors: username, published: true, ...filter };
	const brews = await Homebrew.find(query, fields).lean().exec()
		.catch((error)=>{});
	return brews;
};

HomebrewSchema.statics.setPin  = async function(username, shareId, pin) {
	// Test for User Ownership of brew
	const brew = await Homebrew.findOne({ shareId: shareId }, null).exec()
		.catch((error)=>{});
	if(brew) {
		if(!brew.authors.includes(username)) {
			const Pins = brew.pinned ?? [];
			const index = Pins?.indexOf(username) ?? -1;
			if(!pin) {
				if(index !== -1) brew.pinned.splice(index, 1);
			} else {
				if(index == -1) brew.pinned.push(username);
			}
			if(Pins.length !== brew.pinned.length)
				await brew.save();
		}
	}
};

// INDEXES

HomebrewSchema.index({ updatedAt: -1, lastViewed: -1 });
HomebrewSchema.index({ published: 1, title: 'text' });

HomebrewSchema.index({ lock: 1, sparse: true });
HomebrewSchema.path('lock.reviewRequested').index({ sparse: true });


const Homebrew = mongoose.model('Homebrew', HomebrewSchema);

export {
	HomebrewSchema as schema,
	Homebrew       as model
};
