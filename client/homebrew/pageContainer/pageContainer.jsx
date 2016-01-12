var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var PHBPage = require('./phbPage/phbPage.jsx');

var Markdown = require('marked');

var PageContainer = React.createClass({
	getDefaultProps: function() {
		return {
			text : ""
		};
	},

	renderPages : function(){
		return _.map(this.props.text.split('\\page'), (pageText, index) => {
			return <PHBPage content={Markdown(pageText)} key={index} />
		})
	},

	render : function(){
		var self = this;
		return <div className="pageContainer">
			{this.renderPages()}
		</div>;
	}
});

module.exports = PageContainer;
