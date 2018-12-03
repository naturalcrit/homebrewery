const React = require('react');
const createClass = require('create-react-class');


const BrewCleanup = require('./brewCleanup/brewCleanup.jsx');
const BrewLookup = require('./brewLookup/brewLookup.jsx');
const Stats = require('./stats/stats.jsx');

const Admin = createClass({
	getDefaultProps : function() {
		return {
			adminKey : ''
		};
	},

	render : function(){
		return <div className='admin'>

			<header>
				<div className='container'>
					<i className='fa fa-rocket' />
					homebrewery admin
				</div>
			</header>
			<div className='container'>
				<Stats adminKey={this.props.adminKey} />
				<hr />
				<BrewLookup adminKey={this.props.adminKey} />
				<hr />
				<BrewCleanup adminKey={this.props.adminKey} />
			</div>
		</div>
	}
});

module.exports = Admin;
