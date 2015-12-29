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
			text : text
		});

		//Ajax time
	},

	handleSave : function(){
		this.setState({
			pending : true
		})
		request
			.put('/homebrew/update/' + this.props.id)
			.send({text : this.state.text})
			.end((err, res) => {

				console.log('err', err);
				this.setState({
					pending : false
				})
			})
	},

	render : function(){

		console.log(this.props.entry);

		var temp;
		if(this.state.pending){
			temp = <div>processing</div>
		}


		return <div className='editPage'>
			<button onClick={this.handleSave}>save</button> {temp}

			<Statusbar
				editId={this.props.entry.editId}
				shareId={this.props.entry.shareId}
				isPending={this.state.pending} />

			<Editor text={this.state.text} onChange={this.handleTextChange} />
			<PHB text={this.state.text} />
		</div>
	}
});

module.exports = EditPage;
