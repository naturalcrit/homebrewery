import mongoose from 'mongoose';
import _        from 'lodash';

const NotificationSchema = new mongoose.Schema({
	dismissKey : { type: String, unique: true, required: true },
	title      : { type: String, default: '' },
	text       : { type: String, default: '' },
	createdAt  : { type: Date, default: Date.now },
	startAt    : { type: Date, default: Date.now },
	stopAt     : { type: Date, default: Date.now },
}, { versionKey: false });

NotificationSchema.statics.addNotification = async function(data) {
	if(!data.dismissKey) throw { message: 'Dismiss key is required!' };

	const defaults = {
		title   : '',
		text    : '',
		startAt : new Date(),
		stopAt  : new Date(),
	};

	const notificationData = _.defaults(data, defaults);

	try {
		const newNotification = new this(notificationData);
		const savedNotification = await newNotification.save();
		return savedNotification;
	} catch (err) {
		throw { message: err.message || 'Error saving notification' };
	}
};

NotificationSchema.statics.deleteNotification = async function(dismissKey) {
	if(!dismissKey) throw { message: 'Dismiss key is required!' };

	try {
		const deletedNotification = await this.findOneAndDelete({ dismissKey }).exec();
		if(!deletedNotification) {
			throw { message: 'Notification not found' };
		}
		return deletedNotification;
	} catch (err) {
		throw { message: err.message || 'Error deleting notification' };
	}
};

NotificationSchema.statics.getAll = async function() {
	try {
		const notifications = await this.find().exec();
		return notifications;
	} catch (err) {
		throw { message: err.message || 'Error retrieving notifications' };
	}
};

const Notification = mongoose.model('Notification', NotificationSchema);

export {
	NotificationSchema as schema,
	Notification       as model
};
