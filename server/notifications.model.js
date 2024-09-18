const mongoose = require('mongoose');
const _ = require('lodash');

// Define the schema for the notification
const NotificationSchema = new mongoose.Schema({
	dismissKey : { type: String, unique: true, required: true },
	title      : { type: String, default: '' },
	text       : { type: String, default: '' },
	createdAt  : { type: Date, default: Date.now },
	startAt    : { type: Date, default: Date.now },
	stopAt     : { type: Date, default: Date.now },
}, { versionKey: false });

// Static method to get a notification based on a query
NotificationSchema.statics.get = async function(query, fields = null) {
	try {
		const notifications = await this.find(query, fields).exec();
		if(!notifications.length) throw new Error('Cannot find notification');
		return notifications[0];
	} catch (err) {
		throw new Error(err.message || 'Error finding notification');
	}
};

// Static method to get a notification by its dismiss key
NotificationSchema.statics.getByKey = async function(key, fields = null) {
	try {
		const notification = await this.findOne({ dismissKey: key }, fields).lean().exec();
		if(!notification) throw new Error('Cannot find notification');
		return notification;
	} catch (err) {
		throw new Error(err.message || 'Error finding notification');
	}
};

// Static method to add a new notification
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

// Static method to update a notification
NotificationSchema.statics.updateNotification = async function(dismissKey, title = null, text = null, startAt = null, stopAt = null) {
	if(!dismissKey) return 'No key!';
	if(!title && !text && !startAt && !stopAt) return 'No data!';
	const filter = { dismissKey: dismissKey };
	const data = { title, text, startAt, stopAt };

	// Remove null values from the data object
	for (const [key, value] of Object.entries(data)) {
		if(value === null) delete data[key];
	}

	try {
		const updatedNotification = await this.findOneAndUpdate(filter, data, { new: true }).exec();
		if(!updatedNotification) throw new Error('Cannot find notification');
		return updatedNotification;
	} catch (err) {
		throw new Error(err.message || 'Error updating notification');
	}
};

// Static method to delete a notification
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

// Static method to get all notifications
NotificationSchema.statics.getAll = async function() {
	try {
		const notifications = await this.find().exec();
		return notifications;
	} catch (err) {
		throw new Error(err.message || 'Error retrieving notifications');
	}
};

// Create and export the model
const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = {
	schema : NotificationSchema,
	model  : Notification,
};
