var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var request = require('superagent');

var BrewSearch = React.createClass({

	getDefaultProps: function() {
		return {
			admin_key : ''
		};
	},

	getInitialState: function() {
		return {
			searchTerm: '',
			brew : null,
			searching : false
		};
	},


	search : function(){
		this.setState({
			searching : true
		});

		request.get('/homebrew/api/search?id=' + this.state.searchTerm)
			.query({
				admin_key : this.props.admin_key,
			})
			.end((err, res)=>{
				console.log(err, res, res.body.brews[0]);
				this.setState({
					brew : res.body.brews[0],

					searching : false
				})
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
		</div>
	},

	render : function(){
		return <div className='search'>
			<input type='text' value={this.state.searchTerm} onChange={this.handleChange} />

			<button onClick={this.handleSearchClick}>Search</button>

			{this.renderBrew()}
		</div>
	},

});

module.exports = BrewSearch;