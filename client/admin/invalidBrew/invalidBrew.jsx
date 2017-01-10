
const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const InvalidBrew = React.createClass({
	getDefaultProps: function() {
		return {

		};
	},
	render: function(){
		return <div className='invalidBrew'>
			InvalidBrew Component Ready.
		</div>
	}
});

module.exports = InvalidBrew;
