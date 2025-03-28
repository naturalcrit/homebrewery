require('./lockNotification.less');
const React = require('react');
const request = require('../../../utils/request-middleware.js');
import Dialog from '../../../../components/dialog.jsx';

function LockNotification(props) {
	props = {
		shareId     : 0,
		disableLock : ()=>{},
		lock        : {},
		...props
	};

	const [reviewState, setReviewState] = React.useState(false);

	const removeLock = async ()=>{
		await request.put(`/admin/lock/review/request/${props.shareId}`)
			.then(()=>{
				setReviewState(true);
			});
	};

	const renderReviewButton = function(){
		if(reviewState || props.lock.reviewRequested){ return <button className='inactive'>REVIEW REQUESTED</button>; };
		return <button onClick={removeLock}>REQUEST LOCK REMOVAL</button>;
	};

	return <Dialog className='lockNotification' blocking closeText='CONTINUE TO EDITOR' >
		<h1>BREW LOCKED</h1>
		<p>This brew been locked by the Administrators. It will not be accessible by any method other than the Editor until the lock is removed.</p>
		<hr />
		<h3>LOCK REASON</h3>
		<p>{props.lock.editMessage || 'Unable to retrieve Lock Message'}</p>
		<hr />
		<p>Once you have resolved this issue, click REQUEST LOCK REMOVAL to notify the Administrators for review.</p>
		<p>Click CONTINUE TO EDITOR to temporarily hide this notification; it will reappear the next time the page is reloaded.</p>
		{renderReviewButton()}
	</Dialog>;
};

module.exports = LockNotification;
