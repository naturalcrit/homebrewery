var React = require('react');

var PhbPage = React.createClass({
	getDefaultProps: function() {
		return {
			content : ""
		};
	},
	render : function(){
		return <div className='phb' dangerouslySetInnerHTML={{__html:this.props.content}} />
	}
});

module.exports = PhbPage;
