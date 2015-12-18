var React = require('react');
var _ = require('lodash');
var cx = require('classnames');


var Markdown = require('marked');


var Homebrew = React.createClass({

	getInitialState: function() {
		return {
			text : "# test \nneato"
		};
	},

	handleTextChange : function(e){

		console.log(e.value);
		this.setState({
			text : e.target.value
		})
	},

	render : function(){
		var self = this;

		console.log(this.state.text);
		return(
			<div className='homebrew'>
				<textarea value={this.state.text} onChange={this.handleTextChange} />

				<div className='phb' dangerouslySetInnerHTML={{__html:Markdown(this.state.text)}} />

			</div>
		);
	}
});

module.exports = Homebrew;
