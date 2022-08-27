require('./notificationPopup.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');	//Unused variable

const DISMISS_KEY = 'dismiss_notification08-27-22';

const NotificationPopup = createClass({
	displayName     : 'NotificationPopup',
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
				<em>V3.2.0 Released!</em> <br />
				We are happy to announce that after nearly a year of use by our many users,
				we are making the V3 render mode the default setting for all new brews.
				This mode has become quite popular, and has proven to be stable and powerful.
				Of course, we will always keep the option to use the Legacy renderer for any
				brew, which can still be accessed from the Properties menu.
			</li>;
		},
		refreshGoogle : function (){
			return <li key='refreshGoogle'>
				<em>Refresh your Google Drive Credentials!</em> <br />
				Currently a lot of people are striking issues with their Google credentials expiring, which happens one year after the last sign in via
				Google. This can cause errors when trying to save your brews. If this happens, simply visit the&nbsp;
				<a target='_blank' href='https://www.naturalcrit.com/login'>
				logout page
				</a>
				, sign out, and then sign	back in "with Google" to refresh your credentials. See&nbsp;
				<a target='_blank' href='https://github.com/naturalcrit/homebrewery/discussions/1580'>
					this discussion on Github
				</a> for more details.
			</li>;
		},
		faq : function(){
			return <li key='faq'>
				<em>Protect your work! </em> <br />
				If you opt not to use your Google Drive, keep in mind that we do not save a history of your projects. Please make frequent backups of your brews!&nbsp;
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
			<i className='fas fa-times dismiss' onClick={this.dismiss}/>
			<i className='fas fa-info-circle info' />
			<div className='header'>
				<h3>Notice</h3>
				<small>This website is always improving and we are still adding new features and squashing bugs. Keep the following in mind:</small>
			</div>
			<ul>{_.values(this.state.notifications)}</ul>
		</div>;
	}
});

module.exports = NotificationPopup;
