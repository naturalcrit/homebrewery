import './lockNotification.less';
import * as React from 'react';
import request from '../../../utils/request-middleware.js';
import Dialog from '../../../../components/dialog.jsx';

function LockNotification(props) {
	props = {
		shareId         : 0,
		disableLock     : ()=>{},
		lock            : {},
		message         : 'Unable to retrieve Lock Message',
		reviewRequested : false,
		...props
	};

	const [reviewState, setReviewState] = React.useState(props.reviewRequested);

	const removeLock = async ()=>{
		await request.put(`/api/lock/review/request/${props.shareId}`)
			.then(()=>{
				setReviewState(true);
			});
	};

	const renderReviewButton = function(){
		if(reviewState){ return <button className='inactive'>REVIEW REQUESTED</button>; };
		return <button onClick={removeLock}>REQUEST LOCK REMOVAL</button>;
	};

	return <Dialog className='lockNotification' blocking closeText='CONTINUE TO EDITOR' >
		<h1>BREW LOCKED</h1>
		<p>This brew been locked by the Administrators. It will not be accessible by any method other than the Editor until the lock is removed.</p>
		<hr />
		<h3>LOCK REASON</h3>
		<p>{props.message}</p>
		<hr />
		<p>Once you have resolved this issue, click REQUEST LOCK REMOVAL to notify the Administrators for review.</p>
		<p>Click CONTINUE TO EDITOR to temporarily hide this notification; it will reappear the next time the page is reloaded.</p>
		{renderReviewButton()}
	</Dialog>;
};

module.exports = LockNotification;
