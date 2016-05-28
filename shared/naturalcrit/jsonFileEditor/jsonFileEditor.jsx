var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var JSONEditor = require('jsoneditor');


var downloadFile = function(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}


var JsonFileEditor = React.createClass({
	getDefaultProps: function() {
		return {
			name : "test",
			json : {},
			onJSONChange : function(){}
		};
	},

	getInitialState: function() {
		return {
			showEditor: false
		};
	},
	componentWillReceiveProps: function(nextProps) {
		if(JSON.stringify(nextProps.json) != JSON.stringify(this.editor.get())){
			this.editor.set(nextProps.json);
		}
	},
	componentDidMount: function() {
		this.editor = new JSONEditor(this.refs.editor, {
			change : this.handleJSONChange,
			search : false
		}, this.props.json)
	},

	handleJSONChange : function(){
		this.props.onJSONChange(this.editor.get());
	},
	handleShowEditorClick : function(){
		this.setState({
			showEditor : !this.state.showEditor
		})
	},
	handleDownload  : function(){
		downloadFile(this.props.name + '.json', JSON.stringify(this.props.json, null, '\t'));
	},
	handleUpload : function(e){
		var self = this;
		var reader = new FileReader();
		reader.onload = function() {
			self.props.onJSONChange(JSON.parse(reader.result));
		}
		reader.readAsText(e.target.files[0]);
	},
	handleUploadClick : function(){
		this.refs.uploader.click()
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
					<button className='uploadJSON' onClick={this.handleUploadClick}><i className='fa fa-cloud-upload' /></button>
				</div>

				{this.renderEditor()}
				<input type="file" id="input" onChange={this.handleUpload} ref='uploader' />
			</div>
		);
	}
});

module.exports = JsonFileEditor;

//<div className='remove' onClick={this.handleRemove}><i className='fa fa-times' /></div>