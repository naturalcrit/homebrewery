var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var jsx2json = require('jsx-parser');

var Parts = require('./parts');


var SheetRenderer = React.createClass({
	getDefaultProps: function() {
		return {
			code : '',
			characterData : {},
			onChange : function(){},
		};
	},

	renderElement : function(node, key){
		if(!node.tag) return null;

		if(!Parts[node.tag]) throw 'Could Not Find Element: ' + node.tag

		return React.createElement(
			Parts[node.tag],
			{key : key, ...node.props},
			...this.renderChildren(node.children))
	},
	renderChildren : function(nodes){
		return _.map(nodes, (node, index)=>{
			if(_.isString(node)) return node;
			return this.renderElement(node, index);
		})
	},
	renderSheet : function(){
		try{
			var nodes = jsx2json(this.props.code);
			nodes = _.map(nodes, (node)=>{
				node.props.data = this.props.characterData;
				node.props.onChange = (newData)=>{
					this.props.onChange(_.extend(this.props.characterData, newData));
				}
				return node
			})
			return this.renderChildren(nodes);
		}catch(e){
			return <div>Error bruh {e.toString()}</div>
		}
	},




	render : function(){
		return <div className='sheetRenderer'>

			<h2>Character Sheet</h2>

			<div className='sheetContainer' ref='sheetContainer'>
				{this.renderSheet()}

			</div>

		</div>
	}
});


module.exports = SheetRenderer;


/*

<Temp text="cool">yo test  <a href="google.com">link</a> </Temp>




*/