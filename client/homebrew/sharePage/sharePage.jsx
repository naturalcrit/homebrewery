var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Statusbar = require('../statusbar/statusbar.jsx');

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
		return(
			<div className='sharePage'>
				<Statusbar
					lastUpdated={this.props.entry.updatedAt}
				/>

				<PHB text={this.props.entry.text} />
			</div>
		);
	}
});

module.exports = SharePage;
