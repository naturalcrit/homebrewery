var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var utils = require('../utils');

var Skill = React.createClass({
	getDefaultProps: function() {
		return {
			name : 'skill',
			defaultData : {
				prof : false,
				expert : false,
				val : ''
			},

			id : '',
			label : '',
			sublabel : '',
			showExpert : false
		};
	},

	id : utils.id,
	data : utils.data,
	updateData : utils.updateData,

	handleToggleProf : function(){
		this.updateData({
			prof : !this.data().prof
		})
	},
	handleToggleExpert : function(){
		this.updateData({
			expert : !this.data().expert
		})
	},
	handleValChange : function(e){
		console.log('yo');
		this.updateData({
			val : e.target.value
		})
	},

	renderExpert : function(){
		if(this.props.showExpert){
			return <input type="radio" className='expertToggle' onChange={this.handleToggleExpert} checked={this.data().expert} />
		}
	},

	render : function(){
		return <div className='skill'>
			{this.renderExpert()}
			<input type="radio" className='skillToggle' onChange={this.handleToggleProf} checked={this.data().prof} />
			<input type='text' onChange={this.handleValChange} value={this.data().val} />
			<label>
				{this.props.label}
				<small>{this.props.sublabel}</small>
			</label>
		</div>
	}
});

module.exports = Skill;
