require('./notificationAdd.less');
const React = require('react');
const { useState } = require('react');
const cx = require('classnames');
const request = require('superagent');

const fields = ['dismissKey', 'title', 'text', 'startAt', 'stopAt'];

const NotificationAdd = () => {
    const [state, setState] = useState({
        query: '',
        notificationResult: null,
        searching: false,
        error: null,
        dismissKey: '',
        title: '',
        text: '',
        startAt: '',
        stopAt: ''
    });

    const handleChange = (e, field) => {
        const value = e.target.value;
        setState(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const saveNotification = async () => {
        if (!state.dismissKey) {
            setState(prevState => ({
                ...prevState,
                error: 'No notification key!'
            }));
            return;
        }

        const data = {
            dismissKey: state.dismissKey,
            title: state.title,
            text: state.text,
            startAt: Date.parse(state.startAt),
            stopAt: Date.parse(state.stopAt)
        };

        try {
            const response = await request.post('/admin/notification/add').send(data);
            const notification = response.body;
            let update = {
                notificationResult: `Created notification: ${JSON.stringify(notification, null, 2)}`
            };

            if (notification.err) {
                update.notificationResult = JSON.stringify(notification.err);
                if (notification.err.code == 11000) {
                    update.notificationResult = `Duplicate dismissKey error! ${state.dismissKey} already exists.`;
                }
            } else {
                update = {
                    ...update,
                    dismissKey: '',
                    title: '',
                    text: '',
                    startAt: '',
                    stopAt: ''
                };
            }

            setState(prevState => ({
                ...prevState,
                ...update,
                searching: false
            }));
        } catch (err) {
            setState(prevState => ({
                ...prevState,
                error: err.message,
                searching: false
            }));
        }
    };

    return (
        <div className='notificationAdd'>
            <h2>Add</h2>
            {fields.map((field, idx) => (
                <div key={idx}>
                    <label className='fieldLabel'>{field.toUpperCase()}</label>
                    <input
                        className='fieldInput'
                        type='text'
                        value={state[field]}
                        onChange={(e) => handleChange(e, field)}
                        placeholder={field}
                    />
                </div>
            ))}
            <div className='notificationResult'>{state.notificationResult}</div>
            <button onClick={saveNotification}>
                <i
                    className={cx('fas', {
                        'fa-save': !state.searching,
                        'fa-spin fa-spinner': state.searching
                    })}
                />
            </button>
            {state.error && <div className='error'>{state.error.toString()}</div>}
        </div>
    );
};

module.exports = NotificationAdd;
