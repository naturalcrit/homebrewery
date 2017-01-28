const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const request = require('superagent');
const BrewTable = require('../brewTable/brewTable.jsx');


const InvalidBrew = React.createClass({
	getDefaultProps: function() {
		return {
			adminKey : '',
		};
	},
	getInitialState: function() {
		return {
			brews: []
		};
	},
	getInvalid : function(){
		request.get(`/admin/invalid`)
			.set('x-homebrew-admin', this.props.adminKey)
			.end((err, res) => {
				this.setState({
					brews : res.body
				});
			})
	},
	removeInvalid : function(){
		if(!this.state.brews.length) return;
		if(!confirm(`Are you sure you want to remove ${this.state.brews.length} brews`)) return;
		if(!confirm('Sure you are sure?')) return;

		request.delete(`/admin/invalid`)
			.set('x-homebrew-admin', this.props.adminKey)
			.end((err, res) => {
				console.log(err, res.body);
				alert('Invalid brews removed!');
				this.getInvalid();
			})
	},
	render: function(){
		return <div className='invalidBrew'>
			<h1>Remove Invalid Brews</h1>
			<div>This will removes all brews older than 3 days and shorter than a tweet.</div>
			<button className='get' onClick={this.getInvalid}> Get Invalid Brews</button>
			<button className='remove' disabled={this.state.brews.length == 0} onClick={this.removeInvalid}> Remove invalid Brews</button>

			<BrewTable brews={this.state.brews} />
		</div>
	}
});

module.exports = InvalidBrew;
