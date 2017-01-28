
const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');
const request = require('superagent');

const BrewTable = require('../brewTable/brewTable.jsx');

const LIMIT = 10;

const AdminSearch = React.createClass({
	getDefaultProps: function() {
		return {
			adminKey : '',
		};
	},
	getInitialState: function() {
		return {
			totalBrews : 1,
			brews: [],

			searching : false,
			error : null,

			page : 1,
			searchTerms : ''
		};
	},

	handleSearch : function(e){
		this.setState({
			searchTerms : e.target.value
		});
	},
	handlePage : function(e){
		this.setState({
			page : e.target.value
		});
	},

	search : function(){
		this.setState({ searching : true, error : null });

		request.get(`/api/brew`)
			.query({
				terms : this.state.searchTerms,
				limit : LIMIT,
				page  : this.state.page - 1
			})
			.set('x-homebrew-admin', this.props.adminKey)
			.end((err, res) => {
				if(err){
					this.setState({
						searching : false,
						error : err && err.toString()
					});
				}else{
					this.setState({
						brews : res.body.brews,
						totalBrews : res.body.total
					});
				}
			});
	},

	render: function(){
		return <div className='adminSearch'>
			<h1>Admin Search</h1>
			<div className='controls'>
				<input className='search' type='text' value={this.state.searchTerms} onChange={this.handleSearch} />

				<button onClick={this.search}> <i className='fa fa-search' /> search </button>


				<div className='page'>
					page:
					<input type='text' value={this.state.page} onChange={this.handlePage} />
					/ {Math.ceil(this.state.totalBrews / LIMIT)}
				</div>
			</div>
			<BrewTable brews={this.state.brews} />
		</div>
	}
});

module.exports = AdminSearch;
