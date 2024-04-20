require('./lockNotification.less');
const React = require('react');
const createClass = require('create-react-class');

const LockNotification = createClass({
	displayName     : 'LockNotification',
	getInitialState : function() {
		return {
			disableLock : ()=>{}
		};
	},

	removeLock : function() {
		alert('Not yet implemented');
	},

	render : function(){
		return <div className='lockNotification'>
			<h1>BREW LOCKED</h1>
			<p>This brew been locked by the Administrators. It will not be accessible by any method other than the Editor until the lock is removed.</p>
			<hr />
			<p><strong>LOCK MESSAGE:</strong></p>
			<p>{this.props.message || 'Unable to retrieve Lock Message'}</p>
			<button onClick={()=>{this.props.disableLock();}}>CONTINUE TO EDITOR</button>
			<button onClick={this.removeLock}>REQUEST LOCK REMOVAL</button>
		</div>;
	}
});

module.exports = LockNotification;
