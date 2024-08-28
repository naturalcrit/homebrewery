require('./notificationLookup.less');

const React = require('react');
const { useState } = require('react');
const cx = require('classnames');

const request = require('superagent');
const Moment = require('moment');

const NotificationLookup = () => {
    const [query, setQuery] = useState('');
    const [foundNotification, setFoundNotification] = useState(null);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const lookup = () => {
        setSearching(true);
        setError(null);

        request.get(`/admin/notification/lookup/${query}`)
            .then((res) => setFoundNotification(res.body))
            .catch((err) => setError(err))
            .finally(() => setSearching(false));
    };

    const deleteNotification = () => {
        if (!foundNotification) return;

        const confirmed = window.confirm(`Really delete notification ${foundNotification.dismissKey} : ${foundNotification.title}?`);
        if (!confirmed) {
            console.log('CANCELLED');
            return;
        }
        console.log('CONFIRMED');
        // Perform delete operation here
    };

    const renderFoundNotification = () => {
        if (!foundNotification) return null;

        return (
            <div className='foundNotification'>
                <dl>
                    <dt>Key</dt>
                    <dd>{foundNotification.dismissKey}</dd>

                    <dt>Title</dt>
                    <dd>{foundNotification.title || 'No Title'}</dd>

                    <dt>Text</dt>
                    <dd>{foundNotification.text || 'No Text'}</dd>

                    <dt>Created</dt>
                    <dd>{Moment(foundNotification.createdAt).toLocaleString()}</dd>

                    <dt>Start</dt>
                    <dd>{Moment(foundNotification.startAt).toLocaleString() || 'No Start Time'}</dd>

                    <dt>Stop</dt>
                    <dd>{Moment(foundNotification.stopAt).toLocaleString() || 'No End Time'}</dd>
                </dl>
                <button onClick={deleteNotification}>DELETE</button>
            </div>
        );
    };

    return (
        <div className='notificationLookup'>
            <h2>Lookup</h2>
            <input
                type='text'
                value={query}
                onChange={handleChange}
                placeholder='notification key'
            />
            <button onClick={lookup}>
                <i className={cx('fas', {
                    'fa-search': !searching,
                    'fa-spin fa-spinner': searching,
                })} />
            </button>

            {error && <div className='error'>{error.toString()}</div>}

            {foundNotification
                ? renderFoundNotification()
                : <div className='noNotification'>No notification found.</div>
            }
        </div>
    );
};

module.exports = NotificationLookup;
