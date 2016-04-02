var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var StatusBar = require('./statusBar/statusBar.jsx');
var SheetEditor = require('./sheetEditor/sheetEditor.jsx');
var SheetRenderer = require('./sheetRenderer/sheetRenderer.jsx');


const SPLATSHEET_TEMPLATE = 'splatsheet_template';
const SPLATSHEET_CHARACTER = 'splatsheet_character';


var SplatSheet = React.createClass({

	getInitialState: function() {
		return {
			sheetCode: '',
			characterData : {
				playerInfo : {
					name : 'scott',
					race : 'human',
					class : 'coder'
				}
			}
		};
	},

	componentDidMount: function() {
		this.setState({
			sheetCode : localStorage.getItem(SPLATSHEET_TEMPLATE),
			characterData : JSON.parse(localStorage.getItem(SPLATSHEET_CHARACTER)) || this.state.characterData
		})
	},

	handleCodeChange : function(text){
		this.setState({
			sheetCode : text,
		});
		localStorage.setItem(SPLATSHEET_TEMPLATE, text);
	},

	handeCharacterChange : function(data){
		this.setState({
			characterData : JSON.parse(JSON.stringify(data)),
		});
		localStorage.setItem(SPLATSHEET_CHARACTER, JSON.stringify(data));
	},

	clearCharacterData : function(){
		this.handeCharacterChange({});
	},


	render : function(){
		return <div className='splatsheet'>
			<StatusBar />

			<div className='paneSplit'>
				<div className='leftPane'>
					<SheetEditor code={this.state.sheetCode} onChange={this.handleCodeChange} />
					<h2>
						Character Data
						<i className='fa fa-times' style={{color : 'red'}} onClick={this.clearCharacterData} />
					</h2>
					<pre><code>{JSON.stringify(this.state.characterData, null, '  ')}</code></pre>
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
