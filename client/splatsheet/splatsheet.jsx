var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var StatusBar = require('./statusBar/statusBar.jsx');
var SheetEditor = require('./sheetEditor/sheetEditor.jsx');
var SheetRenderer = require('./sheetRenderer/sheetRenderer.jsx');

var SplatSheet = React.createClass({

	getInitialState: function() {
		return {
			sheetCode: '<div>yo test</div>',
			characterData : {}
		};
	},


	handleCodeChange : function(text){
		this.setState({
			sheetCode : text,
		});
	},

	handeCharacterChange : function(data){

	},


	render : function(){
		return <div className='splatSheet'>
			<StatusBar />

			<div className='paneSplit'>
				<div className='leftPane'>
					<SheetEditor code={this.state.sheetCode} onChange={this.handleCodeChange} />
				</div>
				<div className='rightPane'>
					<SheetRenderer
						code={this.state.sheetCode}
						characterData={this.state.characterData}
						onChange={this.handeCharacterChange} />
				</div>
			</div>
		</div>
	}
});

module.exports = SplatSheet;
