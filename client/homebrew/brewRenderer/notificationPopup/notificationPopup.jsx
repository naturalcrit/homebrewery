require('./notificationPopup.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');	//Unused variable

const DismissSVG = require('../../../../shared/naturalcrit/svg/cross.svg.jsx');

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
			return (
				<>
					<li key='psa'>
						<em>V3.2.0 Released!</em> <br />
						We are happy to announce that after nearly a year of use by our many users,
						we are making the V3 render mode the default setting for all new brews.
						This mode has become quite popular, and has proven to be stable and powerful.
						Of course, we will always keep the option to use the Legacy renderer for any
						brew, which can still be accessed from the Properties menu.
					</li>

					<li key='stubs'>
						<em>Change to Google Drive Storage!</em> <br />
						We have made a change to the process of tranferring brews between Google
						Drive and the Homebrewery storage. Starting now, any time a brew is
						transferred, it will keep the same links instead of generating new ones!
						We hope this change will help reduce issues where people "lost" their work
						by trying to visit old links.
					</li>

					<li key='googleDriveFolder'>
						<em>Don't delete your Homebrewery folder on Google Drive!</em> <br />
						We have had several reports of users losing their brews, not realizing
						that they had deleted the files on their Google Drive. If you have a Homebrewery folder
						on your Google Drive with *.txt files inside, <em>do not delete it</em>!
						We cannot help you recover files that you have deleted from your own
						Google Drive.
					</li>

					<li key='faq'>
						<em>Protect your work! </em> <br />
						If you opt not to use your Google Drive, keep in mind that we do not save a history of your projects. Please make frequent backups of your brews!&nbsp;
						<a target='_blank' href='https://www.reddit.com/r/homebrewery/comments/adh6lh/faqs_psas_announcements/'>
							See the FAQ
						</a> to learn how to avoid losing your work!
					</li>
				</>
			);
		}
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
			<i className='dismiss' onClick={this.dismiss}>
				<DismissSVG />
			</i>
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
