const React = require('react');

const NotificationLookup = require('./notificationLookup/notificationLookup.jsx');
const NotificationAdd = require('./notificationAdd/notificationAdd.jsx');

const NotificationUtils = ()=>{
	return (
		<section className='notificationUtils'>
			<NotificationAdd />
			<NotificationLookup />
		</section>
	);
};

module.exports = NotificationUtils;
