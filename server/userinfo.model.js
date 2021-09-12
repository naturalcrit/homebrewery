const mongoose = require('mongoose');
const _ = require('lodash');

const UserInfoSchema = mongoose.Schema({
	username   : { type: String },
	lastActive : { type: Date, default: Date.now }
});

UserInfoSchema.statics.updateUserActivity = async function(username) {
	let user = await UserInfo.findOne({ username: username }).exec();
	if(!user){ user = new UserInfo; }
	user = _.assign(user, { username: username, lastActive: new Date() });
	await user.save()
	.catch((err)=>{
		return err;
	});
	return user;
};

UserInfoSchema.statics.getUserInfo = function(username){
	return new Promise((resolve, reject)=>{
		UserInfo.find({ username: username }, (err, users)=>{
			if(err || !users.length) return reject('Can not find user');
			return resolve(users[0]);
		});
	});
};

UserInfoSchema.statics.updateUserInfo = async function(userData){
	if(!userData.username){ return false; };
	let user = UserInfo.find({ username: userData.username });
	if(!user){ user = new UserInfo; }
	user = _.assign(user, userData);
	await user.save()
	.catch((err)=>{
		return err;
	});
	return user;
};

const UserInfo = mongoose.model('UserInfo', UserInfoSchema);

module.exports = {
	schema : UserInfoSchema,
	model  : UserInfo,
};
