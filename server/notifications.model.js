const mongoose = require('mongoose');
const _ = require('lodash');

const NotificationSchema = mongoose.Schema({
	dismissKey : { type: String, unique: true, required: true },
	title      : { type: String, default: '' },
	text       : { type: String, default: '' },

	createdAt : { type: Date, default: Date.now },
	startAt   : { type: Date, default: Date.now },
	stopAt    : { type: Date, default: Date.now },
}, { versionKey: false });

NotificationSchema.statics.get = function(query, fields=null){
	return new Promise((resolve, reject)=>{
		Notification.find(query, fields, null, (err, notifications)=>{
			if(err || !notifications.length) return reject('Can not find notification');
			return resolve(notifications[0]);
		});
	});
};

NotificationSchema.statics.getByKey = function(key, fields=null){
	return new Promise((resolve, reject)=>{
		const query = { dissmissKey: key };
		Notification.findOne(query, fields).lean().exec((err, notifications)=>{ //lean() converts results to JSObjects
			if(err) return reject('Can not find notification');
			return resolve(notifications);
		});
	});
};

NotificationSchema.statics.addNotification = async function(data){
	// console.log('add notification');
	if(!data.dismissKey) return 'Dismiss key is required!';
	const defaults = {
		title   : '',
		text    : '',
		startAt : new Date,
		stopAt  : new Date
	};
	_.mergeWith(data, defaults, (item)=>{ if(!item) return undefined; });
	const newNotification = new Notification(data);
	const savedNotification = await newNotification.save()
		.catch((err)=>{
			return { err: err };
		});

	return savedNotification;
};

NotificationSchema.statics.updateNotification = async function(dismissKey, title=null, text=null, startAt=null, stopAt=null){
	if(!dismissKey) return 'No key!';
	if(!title && !text && !startAt && !stopAt) return 'No data!';
	const filter = {
		dismissKey : dismissKey
	};
	const data = {
		title   : title,
		text    : text,
		startAt : startAt,
		stopAt  : stopAt
	};
	for (const [key, value] of Object.entries(data)){
		if(value === null) delete data[key];
	}

	await Notification.findOneAndUpdate(filter, data, { new: true })
		.exec((err, notifications)=>{
			if(err) return reject('Can not find notification');
			return resolve(notifications);
		});
};

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = {
	schema : NotificationSchema,
	model  : Notification,
};
