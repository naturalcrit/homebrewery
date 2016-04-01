var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var babel = require('babel-core')

var SheetRenderer = React.createClass({
	getDefaultProps: function() {
		return {
			code : '',
			characterData : {},
			onChange : function(){},
		};
	},

	componentWillReceiveProps: function(nextProps) {

	},


	renderSheet : function(){
//		var render = jsx.transform(this.props.code);





//		return eval(render);

	},

	render : function(){

		console.log(babel);


		return <div className='SheetRenderer'>


			<div className='sheetContainer' ref='sheetContainer'>
				{this.renderSheet()}

			</div>

		</div>
	}
});

module.exports = SheetRenderer;
