require('./notificationLookup.less');

const React = require('react');
const { useState, useRef } = require('react');
const cx = require('classnames');
const request = require('superagent');
const Moment = require('moment');

const NotificationDetail = ({ notification, onDelete }) => (
    <div>
        <dl>
            <dt>Key</dt>
            <dd>{notification.dismissKey}</dd>

            <dt>Title</dt>
            <dd>{notification.title || 'No Title'}</dd>

            <dt>Text</dt>
            <dd>{notification.text || 'No Text'}</dd>

            <dt>Created</dt>
            <dd>{Moment(notification.createdAt).format('LLLL')}</dd>

            <dt>Start</dt>
            <dd>{Moment(notification.startAt).format('LLLL') || 'No Start Time'}</dd>

            <dt>Stop</dt>
            <dd>{Moment(notification.stopAt).format('LLLL') || 'No End Time'}</dd>
        </dl>
        <button onClick={() => onDelete(notification.dismissKey)}>DELETE</button>
    </div>
);

const NotificationLookup = () => {
    const [foundNotification, setFoundNotification] = useState(null);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    
    const lookupRef = useRef(null);

    const lookup = async () => {
        const query = lookupRef.current.value;

        if (!query.trim()) {
            setError('Please enter a valid dismiss key.');
            return;
        }

        setSearching(true);
        setError(null);

        try {
            const res = await request.get(`/admin/notification/lookup/${query}`);
            if (res.body) {
                setFoundNotification(res.body);
            } else {
                setFoundNotification(null);
                setError('No notification found.');
            }
        } catch {
            setError('Error fetching notification.');
        } finally {
            setSearching(false);
        }
    };

    const lookupAll = async () => {
        setSearching(true);
        setError(null);

        try {
            const res = await request.get('/admin/notification/all');
            setNotifications(res.body || []);
        } catch {
            setError('Error fetching all notifications.');
        } finally {
            setSearching(false);
        }
    };

    const deleteNotification = async (dismissKey) => {
        if (!dismissKey) return;

        const confirmed = window.confirm(
            `Really delete notification ${dismissKey}?`
        );
        if (!confirmed) {
            console.log('CANCELLED');
            return;
        }
        console.log('CONFIRMED');
        try {
            await request.delete(`/admin/notification/delete/${dismissKey}`);
            // Only reset the foundNotification if it matches the one being deleted
            if (foundNotification && foundNotification.dismissKey === dismissKey) {
                setFoundNotification(null);
            }
            // Optionally refresh the list of all notifications
            lookupAll(); 
        } catch {
            setError('Error deleting notification.');
        }
    };

    const renderFoundNotification = () => {
        if (error) {
            return <div className="error">{error}</div>;
        }

        if (!foundNotification) {
            return <div className="noNotification">No notification found.</div>;
        }

        return (
            <div className="foundNotification">
                <NotificationDetail notification={foundNotification} onDelete={deleteNotification} />
            </div>
        );
    };

    const renderNotificationsList = () => {
        if (error) {
            return <div className="error">{error}</div>;
        }

        if (notifications.length === 0) {
            return <div className="noNotifications">No notifications available.</div>;
        }

        return (
            <div className="notificationList">
                {notifications.map((notification) => (
                    <details key={notification.dismissKey}>
                        <summary>{notification.title || 'No Title'}</summary>
                        <NotificationDetail notification={notification} onDelete={deleteNotification} />
                    </details>
                ))}
            </div>
        );
    };

    return (
        <div className="notificationLookup">
            <div className="byId">
                <h2>Lookup</h2>
                <input
                    type="text"
                    ref={lookupRef}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            lookup();
                        }
                    }}
                    placeholder="dismiss key"
                />
                <button onClick={lookup}>
                    <i
                        className={cx('fas', {
                            'fa-search': !searching,
                            'fa-spin fa-spinner': searching,
                        })}
                    />
                </button>

                {renderFoundNotification()}
            </div>
            <div className="all">
                <h2>All Notifications</h2>
                <button onClick={lookupAll}>
                    <i
                        className={cx('fas', {
                            'fa-search': !searching,
                            'fa-spin fa-spinner': searching,
                        })}
                    />
                </button>

                {renderNotificationsList()}
            </div>
        </div>
    );
};

module.exports = NotificationLookup;
