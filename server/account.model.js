const mongoose = require('mongoose');
const _ = require('lodash');


const AccountSchema = mongoose.Schema({
	username   : { type: String, default: '' },
	createdAt  : { type: Date, default: Date.now },
	likedBrews : { type: Array, default: [] }
});

AccountSchema.statics.getAccount = function(username){
	const query = { username: username };
	return new Promise((resolve, reject)=>{
		Account.findOne(query, (err, account)=>{
			if(err || !account) return reject();
			return resolve(account);
		});
	});
};

AccountSchema.statics.addLiked = async function(username, shareId){
	// WIP: Add to likedBrews
	const query = { username: username };
	const account = await Account.findOne(query).exec();
	account.likedBrews = _.union(account.likedBrews, [shareId]);
	await account.save()
	.catch((err)=>{
		return err;
	});
	return account;
};

AccountSchema.statics.removeLiked = function(username, shareId){
	// WIP: Remove from likedBrews
	return;
};

const Account = mongoose.model('Account', AccountSchema);

module.exports = {
	schema : AccountSchema,
	model  : Account,
};
