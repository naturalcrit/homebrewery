var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Statusbar = require('../statusbar/statusbar.jsx');

var PageContainer = require('../pageContainer/pageContainer.jsx');

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
				views : 0
			}
		};
	},

	render : function(){
		return(
			<div className='sharePage'>
				<Statusbar
					lastUpdated={this.props.entry.updatedAt}
					views={this.props.entry.views}
					printId={this.props.entry.shareId}
				/>

				<PageContainer text={this.props.entry.text} />
			</div>
		);
	}
});

module.exports = SharePage;
