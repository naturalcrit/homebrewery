
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');	//Unused variable

const DISMISS_KEY = 'dismiss_notification';

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
		faq : function(){
			return <li key='faq'>
				<em>Protect your work! </em> <br />
				At the moment we do not save a history of your projects, so please make frequent backups of your brews!  &nbsp;
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
