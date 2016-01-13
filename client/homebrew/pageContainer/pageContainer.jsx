var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Markdown = require('marked');

var PageContainer = React.createClass({
	getDefaultProps: function() {
		return {
			text : ""
		};
	},

	renderPages : function(){
		return _.map(this.props.text.split('\\page'), (pageText, index) => {
			return <div className='phb' dangerouslySetInnerHTML={{__html:Markdown(pageText)}} key={index} />
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
