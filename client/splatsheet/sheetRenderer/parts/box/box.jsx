var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Box = React.createClass({
	getDefaultProps: function() {
		return {
			data : {},
			onChange : function(){},
			defaultValue : {},

			id : 'box',
		};
	},

	//Maybe remove
	id : function(){
		return _.snakeCase(this.props.label) || this.props.id;
	},


	data : function(){
		return this.props.data[this.id()] || this.props.defaultValue;
	},


	handleChange : function(newData){
		this.props.onChange({
			[this.id()] : _.extend(this.data(), newData)
		});
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

	render : function(){
		return <div className={cx('box', this.props.className)}>
			{this.renderChildren()}
		</div>
	}
});

module.exports = Box;
