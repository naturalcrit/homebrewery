require('./notificationPopup.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');	//Unused variable

const DISMISS_KEY = 'dismiss_notification7-10-20';

const NotificationPopup = createClass({
	getInitialState : function() {
		return {
			notifications : {}
		};
	},
	componentDidMount : function() {
		this.checkNotifications();
		window.addEventListener('resize', this.checkNotifications);
	},
	componentWillUnmount : function() {
		window.removeEventListener('resize', this.checkNotifications);
	},
	notifications : {
		psa : function(){
			return <li key='psa'>
				<em>Google Drive Integration!</em> <br />
				We have added Google Drive integration to the Homebrewery! <a target='_blank' href='https://www.naturalcrit.com/login'>Sign in</a> with
				your Google account to link it with your Homebrewery profile. A new button in the Edit page will let you transfer your file to your personal
				Google Drive storage, and Google will keep a backup of each version! No more lost work surprises!
				<br /><br />
				However, we are aware that there may be uncaught bugs. We encourage you to copy your brew into a text document before transferring to Google
				Drive just in case any issues arise as this update is rolled out.
				<br /><br />
				<b>Note:</b> Transferring an existing brew to Google Drive will change the edit and share links of your document. If you have shared your
				document online, remember to update the links there as well.
			</li>;
		},
		faq : function(){
			return <li key='faq'>
				<em>Protect your work! </em> <br />
				If you opt not to use your Google Drive, keep in mind that we do not save a history of your projects. Please make frequent backups of your brews!  &nbsp;
				<a target='_blank' href='https://www.reddit.com/r/homebrewery/comments/adh6lh/faqs_psas_announcements/'>
					See the FAQ
				</a> to learn how to avoid losing your work!
			</li>;
		},
	},
	checkNotifications : function(){
		const hideDismiss = localStorage.getItem(DISMISS_KEY);
		if(hideDismiss) return this.setState({ notifications: {} });

		this.setState({
			notifications : _.mapValues(this.notifications, (fn)=>{ return fn(); })	//Convert notification functions into their return text value
		});
	},
	dismiss : function(){
		localStorage.setItem(DISMISS_KEY, true);
		this.checkNotifications();
	},
	render : function(){
		if(_.isEmpty(this.state.notifications)) return null;

		return <div className='notificationPopup'>
			<i className='fa fa-times dismiss' onClick={this.dismiss}/>
			<i className='fa fa-info-circle info' />
			<h3>Notice</h3>
			<small>This website is always improving and we are still adding new features and squashing bugs. Keep the following in mind:</small>
			<ul>{_.values(this.state.notifications)}</ul>
		</div>;
	}
});

module.exports = NotificationPopup;
