const React = require('react');

const NotificationLookup = require('./notificationLookup/notificationLookup.jsx');
const NotificationAdd = require('./notificationAdd/notificationAdd.jsx');

const NotificationUtils = () => {
    return (
        <>
            <NotificationAdd />
            <hr />
            <NotificationLookup />
        </>
    );
};

module.exports = NotificationUtils;
