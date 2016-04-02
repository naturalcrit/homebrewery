var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var utils = require('../utils');

var TextInput = React.createClass({
	getDefaultProps: function() {
		return {
			name : 'text',
			defaultData : '',

			id : '',
			label : '',
		};
	},

	id : utils.id,
	data : utils.data,
	updateData : utils.updateData,

	handleChange : function(e){
		this.updateData(e.target.value);
	},

	renderLabel : function(){
		if(this.props.label) return <label htmlFor={this.id()}>{this.props.label}</label>
	},

	render : function(){
		return <div className='textInput'>
			{this.renderLabel()}
			<input
				id={this.id()}
				type='text'
				onChange={this.handleChange}
				value={this.data()}
				placeholder={this.props.placeholder}
			/>
		</div>
	}
});

module.exports = TextInput;
