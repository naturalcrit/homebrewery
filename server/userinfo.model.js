const mongoose = require('mongoose');
const _ = require('lodash');

const DEFAULT_ACTIVITY_DELAY = 30 * 1000; // milliseconds
const DEFAULT_USER_OPTIONS = {
	renderer : 'V3'
};

const UserInfoSchema = mongoose.Schema({
	options      : { type: Object, default: DEFAULT_USER_OPTIONS },
	badges       : { type: Array, default: [] },
	lastActivity : { type: Date, default: Date.now },
	username     : { type: String, default: '' },
	createdAt    : { type: Date, default: Date.now },
	updatedAt    : { type: Date, default: Date.now }
}, { versionKey: false });

UserInfoSchema.statics.get = function(query, fields=null){
	return new Promise((resolve, reject)=>{
		UserInfo.find(query, fields, null, (err, users)=>{
			if(err || !users.length) return reject('Can not find user');
			return resolve(users[0]);
		});
	});
};

UserInfoSchema.statics.getByUser = function(username, fields=null){
	return new Promise((resolve, reject)=>{
		const query = { username: username };
		UserInfo.find(query, fields).lean().exec((err, users)=>{ //lean() converts results to JSObjects
			if(err) return reject('Can not find user');
			return resolve(users);
		});
	});
};

UserInfoSchema.statics.updateActivity = async function(username) {
	const query = { username: username };
	let user = await UserInfo.findOne(query).exec();
	if(!user) {
		user = new UserInfo;
		user.username = username;
	}

	const now = new Date();
	if(!user.lastActivity || now.setTime(user.lastActivity.getTime() + DEFAULT_ACTIVITY_DELAY) < new Date) {
		user.lastActivity = new Date;

		await user.save()
		.catch((err)=>{
			return err;
		});
	}

	return user;
};

const UserInfo = mongoose.model('UserInfo', UserInfoSchema);

module.exports = {
	schema : UserInfoSchema,
	model  : UserInfo,
};
