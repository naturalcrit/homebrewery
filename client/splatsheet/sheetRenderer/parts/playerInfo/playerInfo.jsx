var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var TextInput = require('../textInput/textInput.jsx');

var Box = require('../box/box.jsx');

var PlayerInfo = React.createClass({
	getDefaultProps: function() {
		return {
			data : {},
			onChange : function(){},

			id : 'playerInfo',
		};
	},
/*
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
			return React.cloneElement(child, {
				onChange : this.handleChange,
				data : this.data()
			})
		})
	},
*/
	render : function(){
		return <Box className='playerInfo' {...this.props}>
			<TextInput id='name' label="Name" />
			<TextInput id='class' label="Class" />
			<TextInput id='race' label="Race" />

			{this.props.children}
		</Box>
	}

	/*{this.props.children}*/

/*
	render : function(){
		return <div className='playerInfo'>
			<TextInput id='name' label="Name" onChange={this.handleChange} data={this.data()} />
			<TextInput id='class' label="Class" onChange={this.handleChange} data={this.data()} />
			<TextInput id='race' label="Race" onChange={this.handleChange} data={this.data()} />

			{this.renderChildren()}
		</div>
	}
	*/
});

module.exports = PlayerInfo;
