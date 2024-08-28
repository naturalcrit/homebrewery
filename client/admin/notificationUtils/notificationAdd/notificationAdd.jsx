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
    const [startAt, setStartAt] = useState(null);
    const [stopAt, setStopAt] = useState(null);

    const saveNotification = async () => {
        const dismissKey = dismissKeyRef.current.value;
        const title = titleRef.current.value;
        const text = textRef.current.value;

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
                setStartAt(null);
                setStopAt(null);
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

            <label className='fieldLabel'>
                DISMISSKEY
                <input
                    className='fieldInput'
                    type='text'
                    ref={dismissKeyRef}
                    placeholder='GOOGLEDRIVENOTIF'
                />
            </label>

            <label className='fieldLabel'>
                TITLE
                <input
                    className='fieldInput'
                    type='text'
                    ref={titleRef}
                    placeholder='Stop using Google Drive as image host'
                />
            </label>

            <label className='fieldLabel'>
                TEXT
                <textarea
					className='fieldInput'
					type='text'
					ref={textRef}
					placeholder='Google Drive is not an image hosting site, you should not use it as such.'>
					</textarea>
            </label>

            <label className='fieldLabel'>
                STARTAT
                <input
					type="date"
                    className='fieldInput'
                    selected={startAt}
                    onChange={date => setStartAt(date)}
                />
            </label>

            <label className='fieldLabel'>
                STOPAT
                <input
					type="date"
                    className='fieldInput'
                    selected={stopAt}
                    onChange={date => setStopAt(date)}
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
