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

	render : function(){
		return <div className='lockNotification'>
			<h1>BREW LOCKED</h1>
			<p>{this.props.message || 'Unable to retrieve Lock Message'}</p>
			<button onClick={()=>{this.props.disableLock();}}>CLICK TO UNLOCK</button>
		</div>;
	}
});

module.exports = LockNotification;
