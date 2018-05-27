const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const request = require('superagent');

const BrewSearch = createClass({

	getDefaultProps : function() {
		return {
			admin_key : ''
		};
	},

	getInitialState : function() {
		return {
			searchTerm : '',
			brew       : null,
		};
	},


	search : function(){
		request.get(`/homebrew/api/search?id=${this.state.searchTerm}`)
			.query({
				admin_key : this.props.admin_key,
			})
			.end((err, res)=>{
				console.log(err, res, res.body.brews[0]);
				this.setState({
					brew : res.body.brews[0],
				});
			});
	},

	handleChange : function(e){
		this.setState({
			searchTerm : e.target.value
		});
	},
	handleSearchClick : function(){
		this.search();
	},

	renderBrew : function(){
		if(!this.state.brew) return null;
		return <div className='brew'>
			<div>Edit id : {this.state.brew.editId}</div>
			<div>Share id : {this.state.brew.shareId}</div>
		</div>;
	},

	render : function(){
		return <div className='search'>
			<input type='text' value={this.state.searchTerm} onChange={this.handleChange} />

			<button onClick={this.handleSearchClick}>Search</button>

			{this.renderBrew()}
		</div>;
	},

});

module.exports = BrewSearch;