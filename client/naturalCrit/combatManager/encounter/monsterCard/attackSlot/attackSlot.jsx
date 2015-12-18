var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var RollDice = require('naturalCrit/rollDice');

var AttackSlot = React.createClass({
	getDefaultProps: function() {
		return {
			name : '',
			uses : null
		};
	},

	getInitialState: function() {
		return {
			lastRoll: {},
			usedCount : 0
		};
	},

	rollDice : function(key, notation){
		var res = RollDice(notation);
		this.state.lastRoll[key] = res
		this.state.lastRoll[key + 'key'] = _.uniqueId(key);
		this.setState({
			lastRoll : this.state.lastRoll
		})
	},

	renderUses : function(){
		var self = this;
		if(!this.props.uses) return null;

		return _.times(this.props.uses, function(index){
			var atCount = index < self.state.usedCount;
			return <i
				key={index}
				className={cx('fa', {'fa-circle-o' : !atCount, 'fa-circle' : atCount})}
				onClick={self.updateCount.bind(self, atCount)}
			/>
		})
	},
	updateCount : function(used){
		this.setState({
			usedCount : this.state.usedCount + (used ? -1 : 1)
		});
	},

	renderNotes : function(){
		var notes = _.omit(this.props, ['name', 'atk', 'dmg', 'uses', 'heal']);
		return _.map(notes, function(text, key){
			return <div key={key}>{key + ': ' + text}</div>
		});
	},

	renderRolls : function(){
		var self = this;

		return _.map(['atk', 'dmg', 'heal'], function(type){
			if(!self.props[type]) return null;
			return <div className={cx('roll', type)} key={type}>

				<button onClick={self.rollDice.bind(self, type, self.props[type])}>
					<i className={cx('fa', {
						'fa-hand-grab-o' : type=='dmg',
						'fa-bullseye' : type=='atk',
						'fa-plus' : type=='heal'
					})} />
					{self.props[type]}
				</button>
				<span key={self.state.lastRoll[type+'key']}>{self.state.lastRoll[type]}</span>
			</div>
		})

	},


	render : function(){
		var self = this;
		return(
			<div className='attackSlot'>
				<div className='info'>
					<div className='name'>{this.props.name}</div>
					<div className='uses'>
						{this.renderUses()}
					</div>
					<div className='notes'>
						{this.renderNotes()}
					</div>

				</div>
				<div className='rolls'>
					{this.renderRolls()}
				</div>
			</div>
		);
	}
});

module.exports = AttackSlot;
