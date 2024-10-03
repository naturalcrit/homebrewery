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
	if(!data.dismissKey) return { success: false, message: 'Dismiss key is required!' };

	const defaults = {
		title   : '',
		text    : '',
		startAt : new Date(),
		stopAt  : new Date(),
	};

	const notificationData = _.defaults(data, defaults);

	if(!(notificationData.startAt instanceof Date) || !(notificationData.stopAt instanceof Date)) {
		return { success: false, message: 'Invalid date format for startAt or stopAt' };
	}

	try {
		const newNotification = new this(notificationData);
		const savedNotification = await newNotification.save();
		return { success: true, notification: savedNotification };
	} catch (err) {
		return { success: false, message: err.message || 'Error saving notification' };
	}
};

NotificationSchema.statics.deleteNotification = async function(dismissKey) {
	if(!dismissKey) return { success: false, message: 'No key provided!' };

	try {
		const deletedNotification = await this.findOneAndDelete({ dismissKey }).exec();
		if(!deletedNotification) {
			return { success: false, message: 'Notification not found' };
		}
		return { success: true, notification: deletedNotification };
	} catch (err) {
		return { success: false, message: err.message || 'Error deleting notification' };
	}
};

NotificationSchema.statics.getAll = async function() {
	try {
		const notifications = await this.find().exec();
		return { success: true, notifications };
	} catch (err) {
		return { success: false, message: err.message || 'Error retrieving notifications' };
	}
};

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = {
	schema : NotificationSchema,
	model  : Notification,
};
