const React = require('react');
const createClass = require('create-react-class');

const NotificationLookup = require('./notificationLookup/notificationLookup.jsx');
const NotificationAdd = require('./notificationAdd/notificationAdd.jsx');

const NotificationUtils = createClass({
	displayName : 'NotificationUtils',

	render : function(){
		return <>
			<NotificationAdd />
			<hr />
			<NotificationLookup />
		</>;
	}
});

module.exports = NotificationUtils;
