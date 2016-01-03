var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Statusbar = require('../statusbar/statusbar.jsx');
var PHB = require('../phb/phb.jsx');
var Editor = require('../editor/editor.jsx');

var request = require("superagent");

var EditPage = React.createClass({
	getDefaultProps: function() {
		return {
			//text : "",
			pending : false,
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

	getInitialState: function() {
		return {
			text: this.props.entry.text,
			pending : false
		};
	},

	handleTextChange : function(text){
		this.setState({
			text : text,
			pending : true
		});
		this.save();
	},

	save : _.debounce(function(){
		request
			.put('/homebrew/update/' + this.props.id)
			.send({text : this.state.text})
			.end((err, res) => {
				this.setState({
					pending : false
				})
			})
	}, 1500),

	render : function(){

		return <div className='editPage'>
			<Statusbar
				editId={this.props.entry.editId}
				shareId={this.props.entry.shareId}
				isPending={this.state.pending} />

			<div className='paneSplit'>
				<div className='leftPane'>
					<Editor text={this.state.text} onChange={this.handleTextChange} />
				</div>
				<div className='rightPane'>
					<PHB text={this.state.text} />
				</div>
			</div>



		</div>
	}
});

module.exports = EditPage;
