require('./notificationPopup.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');	//Unused variable

const DismissSVG = require('../../../../shared/naturalcrit/svg/cross.svg.jsx');

const DISMISS_KEY = 'dismiss_notification09-9-21';

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
				<em>V3.0.0 Released!</em> <br />
				After a long and bumpy road, we decided it was high time we finally release version 3 of the homebrewery into the wild. You can check out a
				brief overview and see how to opt-in to the new features here:&nbsp;
				<a target='_blank' href='https://homebrewery.naturalcrit.com/v3_preview'>V3 Welcome Page</a> and&nbsp;
				<a target='_blank' href='https://homebrewery.naturalcrit.com/changelog'>the Changelog</a>.
				<br /><br />
				<em>BE WARNED:</em> As we continue to develop V3, expect small tweaks in the styling, fonts, and snippets; your brews may look slightly
				different from day-to-day. All of your old documents will continue to work as normal; we are not touching them. If you don't want to deal
				with the possibility of slight formatting changes, you may choose to stick with the Legacy renderer on any of your brews for as long as you like.
				<br /><br />
				With this in mind, if you still wish to try out V3, you can opt-in any of your brews to the the V3 renderer.
				This will likely break much of your formatting as a lot of the Markdown code has been updated, and starting from scratch may be cleaner.
				(Don't worry, you can always change the renderer back to Legacy	for any brew at any time).
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
