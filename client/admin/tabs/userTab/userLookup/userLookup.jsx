require('./userLookup.less');
const React = require('react');
const createClass = require('create-react-class');
const cx    = require('classnames');
const _ = require('lodash');

const request = require('superagent');
const Moment = require('moment');


const UserLookup = createClass({
	getDefaultProps() {
		return {};
	},
	getInitialState() {
		return {
			query     : '',
			foundUser : null,
			searching : false,
			error     : null
		};
	},
	handleChange(e){
		this.setState({ query: e.target.value });
	},
	lookup(){
		this.setState({ searching: true, error: null });

		request.get(`/admin/userlookup/${this.state.query}`)
			.then((res)=>this.setState({ foundUser: res.body }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>this.setState({ searching: false }));
	},

	renderFoundUser(){
		const user = this.state.foundUser;
		return <div className='foundUser'>
			<dl>
				<dt>Username</dt>
				<dd>{user.username}</dd>

				<dt>Last Activity</dt>
				<dd>{user.lastActivity} : {Moment(user.lastActivity).fromNow()}</dd>

				<dt>Options</dt>
				{Object.entries(user.options).map((opt, idx)=>{
					return <dd key={idx}>- {opt.join(' : ')}</dd>;
				})}

				{user.badges?.length > 0 && <>
					<dt>Badges</dt>
					{user.badges.map((badge, idx)=>{
						return <dd key={idx}>{`- ${badge.type}; awarded ${Moment(badge.awardedAt).toLocaleString()}`}</dd>;
					})}
				</>
				}

			</dl>
		</div>;
	},

	render(){
		return <div className='userLookup'>
			<h2>User Lookup</h2>
			<input type='text' value={this.state.query} onChange={this.handleChange} placeholder='username' />
			<button onClick={this.lookup}>
				<i className={cx('fas', {
					'fa-search'          : !this.state.searching,
					'fa-spin fa-spinner' : this.state.searching,
				})} />
			</button>

			{this.state.error
				&& <div className='error'>{this.state.error.toString()}</div>
			}

			{this.state.foundUser
				? this.renderFoundUser()
				: <div className='noUser'>No user found.</div>
			}
		</div>;
	}
});

module.exports = UserLookup;
