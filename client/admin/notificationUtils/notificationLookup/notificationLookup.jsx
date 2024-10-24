require('./notificationLookup.less');

const React = require('react');
const { useState } = require('react');
const request = require('superagent');
const Moment = require('moment');

const NotificationDetail = ({ notification, onDelete })=>(
	<>
		<dl>
			<dt>Key</dt>
			<dd>{notification.dismissKey}</dd>

			<dt>Title</dt>
			<dd>{notification.title || 'No Title'}</dd>

			<dt>Created</dt>
			<dd>{Moment(notification.createdAt).format('LLLL')}</dd>

			<dt>Start</dt>
			<dd>{Moment(notification.startAt).format('LLLL') || 'No Start Time'}</dd>

			<dt>Stop</dt>
			<dd>{Moment(notification.stopAt).format('LLLL') || 'No End Time'}</dd>

			<dt>Text</dt>
			<dd>{notification.text || 'No Text'}</dd>
		</dl>
		<button onClick={()=>onDelete(notification.dismissKey)}>DELETE</button>
	</>
);

const NotificationLookup = ()=>{
	const [searching, setSearching] = useState(false);
	const [error, setError] = useState(null);
	const [notifications, setNotifications] = useState([]);

	const lookupAll = async ()=>{
		setSearching(true);
		setError(null);

		try {
			const res = await request.get('/admin/notification/all');
			setNotifications(res.body || []);
		} catch (err) {
			console.log(err);
			setError(`Error looking up notifications: ${err.response.body.message}`);
		} finally {
			setSearching(false);
		}
	};

	const deleteNotification = async (dismissKey)=>{
		if(!dismissKey) return;

		const confirmed = window.confirm(
			`Really delete notification ${dismissKey}?`
		);
		if(!confirmed) {
			console.log('Delete notification cancelled');
			return;
		}
		console.log('Delete notification confirm');
		try {
			await request.delete(`/admin/notification/delete/${dismissKey}`);
			lookupAll();
		} catch (err) {
			console.log(err);
			setError(`Error deleting notification: ${err.response.body.message}`);
		};
	};

	const renderNotificationsList = ()=>{
		if(error)
			return <div className='error'>{error}</div>;

		if(notifications.length === 0)
			return <div className='noNotification'>No notifications available.</div>;

		return (
			<ul className='notificationList'>
				{notifications.map((notification)=>(
					<li key={notification.dismissKey} >
						<details>
							<summary>{notification.title || 'No Title'}</summary>
							<NotificationDetail notification={notification} onDelete={deleteNotification} />
						</details>
					</li>
				))}
			</ul>
		);
	};

	return (
		<div className='notificationLookup'>
			<h2>Check all Notifications</h2>
			<button onClick={lookupAll}>
				<i className={`fas ${searching ? 'fa-spin fa-spinner' : 'fa-search'}`} />
			</button>
			{renderNotificationsList()}
		</div>
	);
};

module.exports = NotificationLookup;
