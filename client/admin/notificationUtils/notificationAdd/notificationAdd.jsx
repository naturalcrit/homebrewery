require('./notificationAdd.less');
const React = require('react');
const { useState, useRef } = require('react');
const request = require('superagent');

const NotificationAdd = ()=>{
	const [notificationResult, setNotificationResult] = useState(null);
	const [searching, setSearching] = useState(false);
	const [error, setError] = useState(null);

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
		if(!dismissKey || !title || !text || isNaN(startAt.getTime()) || isNaN(stopAt.getTime())) {
			setError('All fields are required');
			return;
		}
		if(startAt >= stopAt) {
			setError('End date must be after the start date!');
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
			setSearching(true);
			setError(null);
			const response = await request.post('/admin/notification/add').send(data);
			console.log(response.body);

			// Reset form fields
			dismissKeyRef.current.value = '';
			titleRef.current.value = '';
			textRef.current.value = '';

			setNotificationResult('Notification successfully created.');
			setSearching(false);
		} catch (err) {
			console.log(err.response.body.message);
			setError(`Error saving notification: ${err.response.body.message}`);
			setSearching(false);
		}
	};

	return (
		<div className='notificationAdd'>
			<h2>Add Notification</h2>

			<label className='field'>
				Dismiss Key:
				<input className='fieldInput' type='text' ref={dismissKeyRef} required
					placeholder='dismiss_notif_drive'
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
				<input type='date' className='fieldInput' ref={stopAtRef} required/>
			</label>

			<div className='notificationResult'>{notificationResult}</div>

			<button className='notificationSave' onClick={saveNotification} disabled={searching}>
				<i className={`fas ${searching ? 'fa-spin fa-spinner' : 'fa-save'}`}/>
				Save Notification
			</button>
			{error && <div className='error'>{error}</div>}
		</div>
	);
};

module.exports = NotificationAdd;
