require('./notificationLookup.less');
const React = require('react');
const createClass = require('create-react-class');
const cx    = require('classnames');

const request = require('superagent');
const Moment = require('moment');


const NotificationLookup = createClass({
	displayName : 'NotificationLookup',
	getDefaultProps() {
		return {};
	},
	getInitialState() {
		return {
			query             : '',
			foundNotification : null,
			searching         : false,
			error             : null
		};
	},
	handleChange(e){
		this.setState({ query: e.target.value });
	},
	lookup(){
		this.setState({ searching: true, error: null });

		request.get(`/admin/notification/lookup/${this.state.query}`)
			.then((res)=>this.setState({ foundNotification: res.body }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>this.setState({ searching: false }));
	},

	renderFoundNotification(){
		const notification = this.state.foundnotification;
		return <div className='foundNotification'>
			<dl>
				<dt>Key</dt>
				<dd>{notification.dismissKey}</dd>

				<dt>Title</dt>
				<dd>{notification.title || 'No Title'}</dd>

				<dt>Text</dt>
				<dd>{notification.text || 'No Text'}</dd>

				<dt>Created</dt>
				<dd>{Moment(notification.createdAt).fromNow()}</dd>

				<dt>Start</dt>
				<dd>{Moment(notification.startAt).fromNow() || 'No Start Time'}</dd>

				<dt>Created</dt>
				<dd>{Moment(notification.stopAt).fromNow() || 'No End Time'}</dd>
			</dl>
		</div>;
	},

	render(){
		return <div className='notificationLookup'>
			<h2>Lookup</h2>
			<input type='text' value={this.state.query} onChange={this.handleChange} placeholder='notification key' />
			<button onClick={this.lookup}>
				<i className={cx('fas', {
					'fa-search'          : !this.state.searching,
					'fa-spin fa-spinner' : this.state.searching,
				})} />
			</button>

			{this.state.error
				&& <div className='error'>{this.state.error.toString()}</div>
			}

			{this.state.foundNotification
				? this.renderFoundNotification()
				: <div className='noNotification'>No notification found.</div>
			}
		</div>;
	}
});

module.exports = NotificationLookup;
