require('./notificationAdd.less');
const React = require('react');
const { useState, useRef } = require('react');
const request = require('superagent');

const NotificationAdd = ()=>{
	const [state, setState] = useState({
		notificationResult : null,
		searching          : false,
		error              : null,
	});

	const dismissKeyRef = useRef(null);
	const titleRef = useRef(null);
	const textRef = useRef(null);
	const startAtRef = useRef(null);
	const stopAtRef = useRef(null);

	const saveNotification = async ()=>{
		const dismissKey = dismissKeyRef.current.value;
		const title = titleRef.current.value;
		const text = textRef.current.value;
		const startAt = new Date(startAtRef.current.value);
		const stopAt = new Date(stopAtRef.current.value);

		// Basic validation
		if (!dismissKey || !title || !text || isNaN(startAt.getTime()) || isNaN(stopAt.getTime())) {
			setState((prevState) => ({
				...prevState,
				error: 'All fields are required',
			}));
			return;
		}
		if (startAt >= stopAt) {
			setState((prevState) => ({
				...prevState,
				error: 'End date must be after the start date!',
			}));
			return;
		}
	
		const data = {
			dismissKey,
			title,
			text,
			startAt : startAt?.toISOString() ?? '',
			stopAt  : stopAt?.toISOString() ?? '',
		};

		try {
			setState((prevState)=>({ ...prevState, searching: true, error: null }));
			const response = await request.post('/admin/notification/add').send(data);
            console.log(response.body);
			const update = { notificationResult: `Notification successfully created.` };

			// Reset form fields
			dismissKeyRef.current.value = '';
			titleRef.current.value = '';
			textRef.current.value = '';

			setState((prevState)=>({
				...prevState,
				...update,
				searching : false,
			}));
		} catch (error) {
            console.log(error.response.body.message);
			setState((prevState)=>({
				...prevState,
				error     : `Error saving notification: ${error.response.body.message}`,
				searching : false,
			}));
		}
	};

	return (
		<div className='notificationAdd'>
			<h2>Add Notification</h2>

			<label className='field'>
                Dismiss Key:
				<input className='fieldInput' type='text' ref={dismissKeyRef} required
					placeholder='GOOGLEDRIVENOTIF'
					
				/>
			</label>

			<label className='field'>
                Title:
				<input className='fieldInput' type='text' ref={titleRef} required
					placeholder='Stop using Google Drive as image host'
				/>
			</label>

			<label className='field'>
                Text:
				<textarea className='fieldInput' type='text' ref={textRef} required
					placeholder='Google Drive is not an image hosting site, you should not use it as such.'
				>
				</textarea>
			</label>

			<label className='field'>
                Start Date:

				<input type='date' className='fieldInput' ref={startAtRef} required/>
			</label>

			<label className='field'>
                End Date:
				<input type='date' className='fieldInput' ref={stopAtRef} required
				/>
			</label>

			<div className='notificationResult'>{state.notificationResult}</div>

			<button className='notificationSave' onClick={saveNotification} disabled={state.searching}>
				<i className={`fas ${state.searching ? 'fa-spin fa-spinner' : 'fa-save'}`} />
                Save Notification
			</button>
			{state.error && <div className='error'>{state.error}</div>}
		</div>
	);
};

module.exports = NotificationAdd;
