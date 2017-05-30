
const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const BrewCard = React.createClass({
	getDefaultProps: function() {
		return {
			brew : {
				shareId : '',
				title : '',
				description : '',

				views : 0,

				editId : false
			}
		};
	},
	render: function(){
		const brew = this.props.brew;
		return <div className='brewCard'>
			<h3>{brew.title}</h3>
			<p>{brew.description}</p>

		</div>
	}
});

module.exports = BrewCard;
