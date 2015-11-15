var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var MonsterCard = require('./monsterCard/monsterCard.jsx');

var attrMod = function(attr){
	return Math.floor(attr/2) - 5;
}

var Encounter = React.createClass({

	getDefaultProps: function() {
		return {
			name : '',
			desc : '',
			reward : '',
			enemies : [],
			index : {},


			monsterManual : {}
		};
	},

	getInitialState: function() {
		return {
			enemies: this.createEnemies(this.props)
		};
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			enemies : this.createEnemies(nextProps)
		})
	},

	createEnemies : function(props){
		var self = this;
		return _.indexBy(_.map(props.enemies, function(type, index){
			return  self.createEnemy(props, type, index)
		}), 'id')
	},

	createEnemy : function(props, type, index){
		var stats = props.index[type] || props.monsterManual[type];
		return _.extend({
			id : type + index,
			name : type,
			currentHP : stats.hp,
			initiative : _.random(1,20) + attrMod(stats.attr.dex)
		}, stats);
	},


	updateHP : function(enemyId, newHP){
		this.state.enemies[enemyId].currentHP = newHP;
		this.setState({
			enemies : this.state.enemies
		});
	},
	removeEnemy : function(enemyId){
		delete this.state.enemies[enemyId];
		this.setState({
			enemies : this.state.enemies
		});
	},


	renderEnemies : function(){
		var self = this;

		var sortedEnemies = _.sortBy(this.state.enemies, function(e){
			return -e.initiative;
		});

		return _.map(sortedEnemies, function(enemy){
			return <MonsterCard
				{...enemy}
				key={enemy.id}
				updateHP={self.updateHP.bind(self, enemy.id)}
				remove={self.removeEnemy.bind(self, enemy.id)} />
		})
	},

	render : function(){
		var self = this;


		return(
			<div className='encounter'>

				<div className='info'>
					{this.props.name}
				</div>


				<div className='cardContainer'>
					{this.renderEnemies()}
				</div>
			</div>
		);
	}
});

module.exports = Encounter;
