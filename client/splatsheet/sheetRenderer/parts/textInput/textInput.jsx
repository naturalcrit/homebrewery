var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var TextInput = React.createClass({
	getDefaultProps: function() {
		return {
			data : {},
			defaultValue : '',
			onChange : function(){},


			id : 'textInput',
			label : '',

		};
	},

	id : function(){
		return _.snakeCase(this.props.label) || this.props.id;
	},
	data : function(){
		return this.props.data[this.id()] || this.props.defaultValue;
	},

	handleChange : function(e){
		this.props.onChange({
			[this.id()] : e.target.value
		});
	},

	renderLabel : function(){
		if(!this.props.label) return;
		return <label htmlFor={this.id()}>{this.props.label}</label>
	},

	render : function(){
		return <div className='textInput'>
			{this.renderLabel()}
			<input id={this.id()} type='text' onChange={this.handleChange} value={this.data()} />
		</div>
	}
});

module.exports = TextInput;
