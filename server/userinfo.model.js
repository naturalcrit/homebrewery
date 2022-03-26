const mongoose = require('mongoose');
const _ = require('lodash');

// UserInfo data structure
const UserInfoSchema = mongoose.Schema({
	username     : { type: String },
	options      : { type: Object, default: {} },
	lastActivity : { type: Date, default: Date.now },

	createdAt : { type: Date, default: Date.now },
	updatedAt : { type: Date, default: Date.now },
	version   : { type: Number, default: 1 }
}, { versionKey: false });


// Update user activity
UserInfoSchema.statics.updateActivity = async function(username) {
	const user = await this.get(username);

	const today = new Date;
	if(today.toDateString() != user.lastActivity.toDateString()){
		user.lastActivity = today;
		await this.updateUser(user)
        .catch((err)=>{return err;});
	};
	return true;
};

// Get the whole User object
UserInfoSchema.statics.get = function(username){
	const query = { username: username };

	return new Promise((resolve, reject)=>{
		UserInfo.findOne(query).lean().exec((err, user)=>{
			if(err || !user) {
				console.log(`Can not find user ${username} - generating new`);
				const newUser = new UserInfo;
				newUser.username = username;
				newUser.lastActivity = new Date('1969-01-01');
				return resolve(newUser);
			}
			return resolve(user);
		});
	});
};

// Update a User object
UserInfoSchema.statics.updateUser = async function(userObject){
	if(!userObject.username) {
		console.log('Error - no username in object');
		return false;
	};

	const userToUpdate = await UserInfo.get(userObject.username);
	let userToSave = new UserInfo(userObject);
	if(userToUpdate) {
		userToSave = _.assign(userToUpdate, userToSave);
	}

	await userToSave.save()
	.catch((err)=>{
		return err;
	});
	return true;
};

// Get only the User options
UserInfoSchema.statics.getUserOpts = function(username){
	return new Promise((resolve, reject)=>{
		const query = { username: username };

		UserInfo.findOne(query).lean().exec((err, user)=>{ //lean() converts results to JSObjects
			if(err) return reject('Can not find user');
			return resolve(user.options);
		});
	});
};

const UserInfo = mongoose.model('UserInfo', UserInfoSchema);

module.exports = {
	schema : UserInfoSchema,
	model  : UserInfo,
};
