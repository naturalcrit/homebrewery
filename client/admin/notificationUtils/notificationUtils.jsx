const React = require('react');
const createClass = require('create-react-class');

const NotificationLookup = require('./notificationLookup/notificationLookup.jsx');

const NotificationUtils = createClass({
	render : function(){
		return <>
			<NotificationLookup />
		</>;
	}
});

module.exports = NotificationUtils;
