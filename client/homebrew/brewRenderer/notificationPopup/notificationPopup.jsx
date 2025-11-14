require('./notificationPopup.less');
import React, { useEffect, useState } from 'react';
import request from '../../utils/request-middleware.js';
import Markdown from 'markdown.js';

import Dialog from '../../../components/dialog.jsx';

const DISMISS_BUTTON = <i className='fas fa-times dismiss' />;

const NotificationPopup = ()=>{
	const [notifications, setNotifications] = useState([]);
	const [dissmissKeyList, setDismissKeyList] = useState([]);
	const [error, setError] = useState(null);

	useEffect(()=>{
		getNotifications();
	}, []);

	const getNotifications = async ()=>{
		setError(null);
		try {
			const res = await request.get('/admin/notification/all');
			pickActiveNotifications(res.body || []);
		} catch (err) {
			console.log(err);
			setError(`Error looking up notifications: ${err?.response?.body?.message || err.message}`);
		}
	};

	const pickActiveNotifications = (notifs)=>{
		const now = new Date();
		const filteredNotifications = notifs.filter((notification)=>{
			const startDate = new Date(notification.startAt);
			const stopDate = new Date(notification.stopAt);
			const dismissed = localStorage.getItem(notification.dismissKey) ? true : false;
			return now >= startDate && now <= stopDate && !dismissed;
		});
		setNotifications(filteredNotifications);
		setDismissKeyList(filteredNotifications.map((notif)=>notif.dismissKey));
	};

	const renderNotificationsList = ()=>{
		if(error) return <div className='error'>{error}</div>;
		return notifications.map((notification)=>(
			<li key={notification.dismissKey} >
				<em>{notification.title}</em><br />
				<p dangerouslySetInnerHTML={{ __html: Markdown.render(notification.text) }}></p>
			</li>
		));
	};

	if(!notifications.length) return;
	return <Dialog className='notificationPopup' dismisskeys={dissmissKeyList} closeText={DISMISS_BUTTON} >
		<div className='header'>
			<i className='fas fa-info-circle info'></i>
			<h3>Notice</h3>
			<small>This website is always improving and we are still adding new features and squashing bugs. Keep the following in mind:</small>
		</div>
		<ul>
			{renderNotificationsList()}
		</ul>
	</Dialog>;
};

module.exports = NotificationPopup;
