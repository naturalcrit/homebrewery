var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var TextInput = require('../textInput/textInput.jsx');
var Box = require('../box/box.jsx');

var PlayerInfo = React.createClass({
	getDefaultProps: function() {
		return {
			title: "player info",
			border : true
		};
	},
	render : function(){
		return <Box className='playerInfo' {...this.props} >
			<TextInput label="Name" placeholder="name" />
			<TextInput label="Class" />
			<TextInput label="Race" />
			{this.props.children}
		</Box>
	}
});

module.exports = PlayerInfo;
