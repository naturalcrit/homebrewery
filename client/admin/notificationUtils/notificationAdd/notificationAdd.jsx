require('./notificationAdd.less');
const React = require('react');
const { useState, useRef } = require('react');
const cx = require('classnames');
const request = require('superagent');

const NotificationAdd = () => {
    const [state, setState] = useState({
        notificationResult: null,
        searching: false,
        error: null,
    });

    const dismissKeyRef = useRef(null);
    const titleRef = useRef(null);
    const textRef = useRef(null);
    const startAtRef = useRef(null);
    const stopAtRef = useRef(null);

    const saveNotification = async () => {
        const dismissKey = dismissKeyRef.current.value;
        const title = titleRef.current.value;
        const text = textRef.current.value;
        const startAt = new Date(startAtRef.current.value);
        const stopAt = new Date(stopAtRef.current.value);

        // Basic validation
        if (!dismissKey || !title || !text || !startAt || !stopAt) {
            setState(prevState => ({
                ...prevState,
                error: 'All fields are required!',
            }));
            return;
        }

        const data = {
            dismissKey,
            title,
            text,
            startAt: startAt ? startAt.toISOString() : '',
            stopAt: stopAt ? stopAt.toISOString() : '',
        };

        try {
            setState(prevState => ({ ...prevState, searching: true, error: null }));
            const response = await request.post('/admin/notification/add').send(data);
            const notification = response.body;

            let update = {
                notificationResult: `Created notification: ${JSON.stringify(notification, null, 2)}`,
            };

            if (notification.err) {
                update.notificationResult = JSON.stringify(notification.err);
                if (notification.err.code === 11000) {
                    update.notificationResult = `Duplicate dismissKey error! ${dismissKey} already exists.`;
                }
            } else {
                update = {
                    ...update,
                    notificationResult: `Notification successfully created.`,
                };
                // Reset form fields
                dismissKeyRef.current.value = '';
                titleRef.current.value = '';
                textRef.current.value = '';
            }

            setState(prevState => ({
                ...prevState,
                ...update,
                searching: false,
            }));
        } catch (err) {
            setState(prevState => ({
                ...prevState,
                error: `Error saving notification: ${err.message}`,
                searching: false,
            }));
        }
    };

    return (
        <div className='notificationAdd'>
            <h2>Add Notification</h2>

            <label className='field'>
                Dismiss Key:
                <input
                    className='fieldInput'
                    type='text'
                    ref={dismissKeyRef}
                    placeholder='GOOGLEDRIVENOTIF'
                    required
                />
            </label>

            <label className='field'>
                Title:
                <input
                    className='fieldInput'
                    type='text'
                    ref={titleRef}
                    placeholder='Stop using Google Drive as image host'
                    required
                />
            </label>

            <label className='field'>
                Text:
                <textarea
					className='fieldInput'
					type='text'
					ref={textRef}
					placeholder='Google Drive is not an image hosting site, you should not use it as such.'
                    required>
					</textarea>
            </label>

            <label className='field'>
                Start Date:

                <input
					type="date"
                    className='fieldInput'
                    ref={startAtRef}
                    required
                />
            </label>

            <label className='field'>
                End Date:
                <input
					type="date"
                    className='fieldInput'
                    ref={stopAtRef}
                    required
                />
            </label>

            <div className='notificationResult'>{state.notificationResult}</div>

            <button className='notificationSave' onClick={saveNotification} disabled={state.searching}>
                <i
                    className={cx('fas', {
                        'fa-save': !state.searching,
                        'fa-spin fa-spinner': state.searching,
                    })}
                />
                Save Notification
            </button>

            {state.error && <div className='error'>{state.error}</div>}
        </div>
    );
};

module.exports = NotificationAdd;
