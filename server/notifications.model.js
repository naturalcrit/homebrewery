const mongoose = require('mongoose');
const _ = require('lodash');

const NotificationSchema = new mongoose.Schema({
	dismissKey : { type: String, unique: true, required: true },
	title      : { type: String, default: '' },
	text       : { type: String, default: '' },
	createdAt  : { type: Date, default: Date.now },
	startAt    : { type: Date, default: Date.now },
	stopAt     : { type: Date, default: Date.now },
}, { versionKey: false });

NotificationSchema.statics.addNotification = async function(data) {
	if(!data.dismissKey) return 'Dismiss key is required!';
	const defaults = {
		title   : '',
		text    : '',
		startAt : new Date(),
		stopAt  : new Date()
	};
	_.defaults(data, defaults);
	const newNotification = new this(data);
	try {
		const savedNotification = await newNotification.save();
		return savedNotification;
	} catch (err) {
		throw new Error(err.message || 'Error saving notification');
	}
};

NotificationSchema.statics.deleteNotification = async function(dismissKey) {
	if(!dismissKey) return 'No key provided!';
	try {
		const deletedNotification = await this.findOneAndDelete({ dismissKey }).exec();
		if(!deletedNotification) throw new Error('Notification not found');
		return deletedNotification;
	} catch (err) {
		throw new Error(err.message || 'Error deleting notification');
	}
};

NotificationSchema.statics.getAll = async function() {
	try {
		const notifications = await this.find().exec();
		return notifications;
	} catch (err) {
		throw new Error(err.message || 'Error retrieving notifications');
	}
};

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = {
	schema : NotificationSchema,
	model  : Notification,
};
