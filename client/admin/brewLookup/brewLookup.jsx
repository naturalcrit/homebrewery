const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const request = require('superagent');

const BrewLookup = React.createClass({
	getDefaultProps: function() {
		return {
			adminKey : '',
		};
	},
	getInitialState: function() {
		return {
			query:'',
			resultBrew : null
		};
	},

	handleChange : function(e){
		this.setState({
			query : e.target.value
		})
	},
	lookup : function(){


	},

	renderFoundBrew : function(){
		if(!this.state.resultBrew) return null;
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
