require('./lockNotification.less');
const React = require('react');

function LockNotification(props) {
	props = {
		shareId     : 0,
		disableLock : ()=>{},
		...props
	}

	const removeLock = () => {
		alert(`Not yet implemented - ID ${props.shareId}`);
	};

	return <div className='lockNotification'>
		<h1>BREW LOCKED</h1>
		<p>This brew been locked by the Administrators. It will not be accessible by any method other than the Editor until the lock is removed.</p>
		<hr />
		<h3>LOCK REASON</h3>
		<p>{props.message || 'Unable to retrieve Lock Message'}</p>
		<hr />
		<p>Once you have resolved this issue, click REQUEST LOCK REMOVAL to notify the Administrators for review.</p>
		<p>Click CONTINUE TO EDITOR to temporarily hide this notification; it will reappear the next time the page is reloaded.</p>
		<button onClick={props.disableLock}>CONTINUE TO EDITOR</button>
		<button onClick={removeLock}>REQUEST LOCK REMOVAL</button>
	</div>;
};

module.exports = LockNotification;
