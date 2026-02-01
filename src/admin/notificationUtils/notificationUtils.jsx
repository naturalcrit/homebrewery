import React from 'react';
import NotificationLookup from './notificationLookup/notificationLookup.jsx';
import NotificationAdd from './notificationAdd/notificationAdd.jsx';

const NotificationUtils = ()=>{
	return (
		<section className='notificationUtils'>
			<NotificationAdd />
			<NotificationLookup />
		</section>
	);
};

export default NotificationUtils;
