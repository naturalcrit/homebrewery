var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var RollDice = require('naturalcrit/rollDice');

var DmDice = React.createClass({

	getInitialState: function() {
		return {
			lastRoll:{ },
			diceNotation : {
				a : "1d20",
				b : "6d6 + 3",
				c : "1d20 - 1"
			}

		};
	},

	roll : function(id){
		this.state.lastRoll[id] = RollDice(this.state.diceNotation[id]);
		this.setState({
			lastRoll : this.state.lastRoll
		});
	},
	handleChange : function(id, e){
		this.state.diceNotation[id] = e.target.value;
		this.setState({
			diceNotation : this.state.diceNotation
		});

		e.stopPropagation();
		e.preventDefault();
	},

	renderRolls : function(){
		var self = this;
		return _.map(['a', 'b', 'c'], function(id){
			return <div className='roll' key={id} onClick={self.roll.bind(self, id)}>
				<input type="text" value={self.state.diceNotation[id]} onChange={self.handleChange.bind(self, id)} />
				<i className='fa fa-random' />
				<span key={self.state.lastRoll[id]}>{self.state.lastRoll[id]}</span>
			</div>
		})
	},

	render : function(){
		var self = this;
		return(
			<div className='dmDice'>
				<h3> <i className='fa fa-random' /> DM Dice </h3>
				{this.renderRolls()}
			</div>
		);
	}
});

module.exports = DmDice;
