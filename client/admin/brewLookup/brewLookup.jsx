const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const request = require('superagent');
const BrewTable = require('../brewTable/brewTable.jsx');

const BrewLookup = React.createClass({
	getDefaultProps: function() {
		return {
			adminKey : '',
		};
	},
	getInitialState: function() {
		return {
			query:'',
			resultBrew : null,
			searching : false
		};
	},

	handleChange : function(e){
		this.setState({
			query : e.target.value
		})
	},
	lookup : function(){
		this.setState({ searching : true });

		request.get(`/admin/lookup/${this.state.query}`)
			.query({ admin_key : this.props.adminKey })
			.end((err, res) => {
				this.setState({
					searching : false,
					resultBrew : (err ? null : res.body)
				});
			})
	},

	renderFoundBrew : function(){
		if(this.state.searching) return <div className='searching'><i className='fa fa-spin fa-spinner' /></div>;
		if(!this.state.resultBrew) return <div className='noBrew'>No brew found.</div>;

		return <BrewTable brews={[this.state.resultBrew ]} />

		const brew = this.state.resultBrew;
		return <div className='brewRow'>
			<div>{brew.title}</div>
			<div>{brew.authors.join(', ')}</div>
			<div><a href={'/edit/' + brew.editId} target='_blank'>{brew.editId}</a></div>
			<div><a href={'/share/' + brew.shareId} target='_blank'>{brew.shareId}</a></div>
			<div>{Moment(brew.updatedAt).fromNow()}</div>
			<div>{brew.views}</div>
			<div>
				<div className='deleteButton'>
					<i className='fa fa-trash' />
				</div>
			</div>
		</div>
	},

	render: function(){
		return <div className='brewLookup'>
			<h1>Brew Lookup</h1>
			<input type='text' value={this.state.query} onChange={this.handleChange} placeholder='edit or share id...' />
			<button onClick={this.lookup}><i className='fa fa-search'/></button>

			{this.renderFoundBrew()}
		</div>
	}
});

module.exports = BrewLookup;
