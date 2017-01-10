const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const request = require('superagent');
const BrewTable = require('../brewTable/brewTable.jsx');


const InvalidBrew = React.createClass({
	getDefaultProps: function() {
		return {

		};
	},
	getInitialState: function() {
		return {
			brews: []
		};
	},
	getInvalid : function(){
		request.get(`/admin/invalid`)
			.query({ admin_key : this.props.adminKey })
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
			.query({ admin_key : this.props.adminKey })
			.end((err, res) => {
				console.log(err, res.body);
				alert('Invalid brews removed!');
				this.getInvalid();
			})
	},
	render: function(){
		return <div className='invalidBrew'>
			<h1>Remove Invalid Brews</h1>
			This will removes all brews older than 3 days and shorter than a tweet.
			<button className='get' onClick={this.getInvalid}> Get Invalid Brews</button>
			<button className='remove' onClick={this.removeInvalid}> Remove invalid Brews</button>

			<BrewTable brews={this.state.brews} />
		</div>
	}
});

module.exports = InvalidBrew;
