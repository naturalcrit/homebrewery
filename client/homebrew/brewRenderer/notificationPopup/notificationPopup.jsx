require('./notificationPopup.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');	//Unused variable

const DISMISS_KEY = 'dismiss_notification12-04-23';
const translateOpts = ['notificationPopup'];

const NotificationPopup = createClass({
	displayName     : 'NotificationPopup',
	getInitialState : function() {
		''.setTranslationDefaults(translateOpts);
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
		// as the following is a text that is supposed to recieve updates usually, we will keep it untranslated by now.
		psa : function(){
			return (
				<>
					<li key='psa'>
						<em>Broken default logo on <b>CoverPage</b> </em> <br />
						If you have used the Cover Page snippet and notice the Naturalcrit
						logo is showing as a broken image, this is due to some small tweaks
						of this BETA feature. To fix the logo in your cover page, rename
						the image link <b>"/assets/naturalCritLogoRed.svg"</b>. Remember
						that any snippet marked "BETA" may have a similar change in the
						future as we encounter any bugs or reworks.
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
			<i className='fas fa-times dismiss' onClick={this.dismiss}/>
			<i className='fas fa-info-circle info' />
			<div className='header'>
				<h3>{'Notice'.translate()}</h3>
				<small>{'keepInMind'.translate()}:</small>
			</div>
			<ul>{_.values(this.state.notifications)}</ul>
		</div>;
	}
});

module.exports = NotificationPopup;
