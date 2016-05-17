var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('./navbar/navbar.jsx');

var SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
var SheetEditor = require('./sheetEditor/sheetEditor.jsx');
var SheetRenderer = require('./sheetRenderer/sheetRenderer.jsx');


const SPLATSHEET_TEMPLATE = 'splatsheet_template';
const SPLATSHEET_DATA = 'splatsheet_data';



var TPK = React.createClass({


	getInitialState: function() {
		return {
			sheetCode: "<Box>\n\t<TextInput label='test' />\n</Box>",

			sheetData : {}
		};
	},

	//remove later
	componentDidMount: function() {
		this.setState({
			sheetCode : localStorage.getItem(SPLATSHEET_TEMPLATE) || this.state.sheetCode,
			sheetData : JSON.parse(localStorage.getItem(SPLATSHEET_DATA)) || this.state.sheetData
		})
	},

	handleSplitMove : function(){
		this.refs.editor.update();
	},

	handleCodeChange : function(code){
		this.setState({
			sheetCode : code
		});

		localStorage.setItem(SPLATSHEET_TEMPLATE, code);
	},

	handleDataChange : function(data){
		this.setState({
			sheetData : JSON.parse(JSON.stringify(data)),
		});
		localStorage.setItem(SPLATSHEET_DATA, JSON.stringify(data));
	},

	render : function(){
		return <div className='tpk page'>
			<Navbar>
				<Nav.section>
					<Nav.item>
						yo dawg
					</Nav.item>
				</Nav.section>
			</Navbar>
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<SheetEditor value={this.state.sheetCode} onChange={this.handleCodeChange} ref='editor' />
					<SheetRenderer
						code={this.state.sheetCode}
						characterData={this.state.sheetData}
						onChange={this.handleDataChange} />
				</SplitPane>
			</div>
		</div>
	}
});

module.exports = TPK;
