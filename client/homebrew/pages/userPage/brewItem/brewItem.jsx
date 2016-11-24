const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const BrewItem = React.createClass({
	getDefaultProps: function() {
		return {
			brew : {

			}
		};
	},

	render : function(){
		return <div className='brewItem'>
			BrewItem Component Ready.
		</div>
	}
});

module.exports = BrewItem;
