var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var PHB = require('../phb/phb.jsx');

var SharePage = React.createClass({
	getDefaultProps: function() {
		return {
			id : null,
			entry : {
				text : "",
				shareId : null,
				editId : null,
				createdAt : null,
				updatedAt : null,
			}
		};
	},

	render : function(){
		console.log(this.props.entry);
		return(
			<div className='sharePage'>
				<PHB text={this.props.entry.text} />
			</div>
		);
	}
});

module.exports = SharePage;
