const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const hashPassword = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

const AccountSchema = mongoose.Schema({
	username    : { type: String, required: true, index: { unique: true } },
	password    : { type: String, required: true, set: hashPassword },
	passport    : Map,
	reddit_id   : { type: String, index: { sparse: true, unique: true } },
	twitter_id  : { type: String, index: { sparse: true, unique: true } },
	google_id   : { type: String, index: { sparse: true, unique: true } },
	facebook_id : { type: String, index: { sparse: true, unique: true } }
});

AccountSchema.statics.serializeAccount = function() {
	return function (account, done) {
		done(null, account.id);
	};
};

AccountSchema.statics.deserializeAccount = function() {
	const that = this;
	return function (accountId, done) {
		that.findById(accountId, done);
	};
};

AccountSchema.post('save', function(error, doc, next) {
	if(error.name == 'MongoError' && error.code == 11000) {
		return next('This username is already taken');
	}

	next(error);
});

AccountSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

AccountSchema.virtual('old').get(function(){
	return false;
});

const Account = mongoose.model('Account', AccountSchema);

module.exports = {
	schema : AccountSchema,
	model  : Account,
};