var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var utils = require('../utils');

var Box = React.createClass({
	mixins : [utils],
	getDefaultProps: function() {
		return {
			//name : 'box',
			defaultData : {},

			id : '',
			title : '',
			label : '',
			shadow : false,
			border : false
		};
	},

	handleChange : function(newData){
		this.updateData(newData);
	},

	renderChildren : function(){
		return React.Children.map(this.props.children, (child)=>{
			if(!React.isValidElement(child)) return null;
			return React.cloneElement(child, {
				onChange : this.handleChange,
				data : this.data()
			})
		})
	},
	renderTitle : function(){
		if(this.props.title) return <h5 className='title'>{this.props.title}</h5>
	},
	renderLabel : function(){
		if(this.props.label) return <h5 className='label'>{this.props.label}</h5>
	},

	render : function(){
		return <div className={cx('box', this.props.className, {
				shadow : this.props.shadow,
				border : this.props.border
			})}>
			{this.renderTitle()}
			{this.renderChildren()}
			{this.renderLabel()}
		</div>
	}
});

module.exports = Box;
