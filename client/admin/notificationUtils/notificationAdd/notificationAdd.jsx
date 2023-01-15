require('./notificationAdd.less');
const React = require('react');
const createClass = require('create-react-class');
const cx    = require('classnames');

const request = require('superagent');

const fields = ['dismissKey', 'title', 'text', 'startAt', 'stopAt'];


const NotificationAdd = createClass({
	displayName : 'NotificationAdd',
	getDefaultProps() {
		return {};
	},
	getInitialState() {
		return {
			query              : '',
			notificationResult : null,
			searching          : false,
			error              : null,

			dismissKey : '',
			title      : '',
			text       : '',
			startAt    : '',
			stopAt     : ''
		};
	},
	handleChange(e, field){
		const data = {};
		data[field] = e.target.value;
		this.setState(data);
	},
	saveNotification : async function(){
		if(!this.state.dismissKey) return 'No notification key!';
		const data = {
			dismissKey : this.state.dismissKey,
			title      : this.state.title,
			text       : this.state.text,
			startAt    : this.state.startAt,
			stopAt     : this.state.stopAt
		};

		const notification = await request.post('/admin/notification/add')
			.send(data)
			.then((response)=>{
				return response.body;
			});

		const update = {
			notificationResult : `Created notification: ${JSON.stringify(notification, null, 2)}`
		};
		if(notification.err) {
			update.notificationResult = err;
		};
		if(!notification.err) {
			update.dismissKey = '';
			update.title = '';
			update.text = '';
			update.startAt = '';
			update.stopAt = '';
		}

		this.setState(update);
	},

	render(){
		return <div className='notificationAdd'>
			<h2>Add</h2>
			{fields.map((field, idx)=>{
				return <div key={idx}>
					<label className='fieldLabel'>{field.toUpperCase()}</label>
					<input className='fieldInput' type='text' value={this.state[field]} onChange={(e)=>this.handleChange(e, field)} placeholder={field} />
				</div>;
			})}
			{this.state.notificationResult}
			{/* <label>Dismiss Key:</label>
			<input type='text' value={this.state.dismissKey} onChange={this.handleChange} placeholder='notification key' />
			<label>Title:</label>
			<input type='text' value={this.state.title} onChange={this.handleChange} placeholder='title' />  */}
			<button onClick={this.saveNotification}>
				<i className={cx('fas', {
					'fa-save'            : !this.state.searching,
					'fa-spin fa-spinner' : this.state.searching,
				})} />
			</button>

			{this.state.error
				&& <div className='error'>{this.state.error.toString()}</div>
			}
		</div>;
	}
});

module.exports = NotificationAdd;
