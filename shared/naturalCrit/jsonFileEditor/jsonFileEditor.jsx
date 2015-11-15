var React = require('react');
var _ = require('lodash');
var cx = require('classnames');


var JSONEditor = require('jsoneditor');

//var editor = new JSONEditor(container);

var json = {
	test : 6,
	arr : [true, 1,2,3,4],
	yo : {
		yeah : true
	}
}


var JsonFileEditor = React.createClass({
	getDefaultProps: function() {
		return {
			name : "yo",

			json : json,

			onJSONChange : function(){}
		};
	},

	getInitialState: function() {
		return {
			showEditor: false
		};
	},

	componentWillReceiveProps: function(nextProps) {
		//this.editor.set(nextProps.json);
	},

	componentDidMount: function() {
		this.editor = new JSONEditor(this.refs.editor, {
			change : this.handleJSONChange,
			search : false
		}, this.props.json)
	},




	handleJSONChange : function(){

		this.props.onJSONChange(this.editor.get());

		//try to store in local storage?

	},

	handleShowEditorClick : function(){
		this.setState({
			showEditor : !this.state.showEditor
		})
	},

	handleDownload  : function(){

	},
	handleRemove  : function(){

	},


	renderEditor : function(){
		return <div className='jsonEditor' ref='editor' />
	},


	render : function(){
		var self = this;
		return(
			<div className={cx('jsonFileEditor', {'showEditor' : this.state.showEditor})}>

				<span className='name'>{this.props.name}</span>


				<div className='controls'>


					<button className='showEditor' onClick={this.handleShowEditorClick}><i className='fa fa-edit' /></button>
					<button className='downloadJSON' onClick={this.handleDownload}><i className='fa fa-download' /></button>
					<div className='remove' onClick={this.handleRemove}><i className='fa fa-times' /></div>


				</div>


				{this.renderEditor()}

			</div>
		);
	}
});

module.exports = JsonFileEditor;
