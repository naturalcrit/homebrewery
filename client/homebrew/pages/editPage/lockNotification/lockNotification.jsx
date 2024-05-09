require('./lockNotification.less');
const React = require('react');
const createClass = require('create-react-class');

const LockNotification = createClass({
	displayName : 'LockNotification',

	getDefaultProps : function() {
		return {
			shareId : 0
		};
	},

	getInitialState : function() {
		return {
			disableLock : ()=>{}
		};
	},

	removeLock : function() {
		alert(`Not yet implemented - ID ${this.props.shareId}`);
	},

	render : function(){
		return <div className='lockNotification'>
			<h1>BREW LOCKED</h1>
			<p>This brew been locked by the Administrators. It will not be accessible by any method other than the Editor until the lock is removed.</p>
			<hr />
			<h3>LOCK REASON</h3>
			<p>{this.props.message || 'Unable to retrieve Lock Message'}</p>
			<hr />
			<p>Once you have resolved this issue, click REQUEST LOCK REMOVAL to notify the Administrators for review.</p>
			<p>Click CONTINUE TO EDITOR to temporarily hide this notification; it will reappear the next time the page is reloaded.</p>
			<button onClick={this.props.disableLock}>CONTINUE TO EDITOR</button>
			<button onClick={this.removeLock}>REQUEST LOCK REMOVAL</button>
		</div>;
	}
});

module.exports = LockNotification;
