var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var MonsterCard = require('./monsterCard/monsterCard.jsx');


var encounter = {

	name : 'The Big Bad',
	enemies : ['goblin', 'goblin'],
	reserve : ['goblin'],

}

var MonsterManual = {
	'goblin' : {
		"hp" : 40,
		"mov": 30,
		"ac" : 13,
		"attr" : {
			"str" : 8,
			"con" : 8,
			"dex" : 8,
			"int" : 8,
			"wis" : 8,
			"cha" : 8
		},
		"attacks" : {
			"dagger" : {
				"atk" : "1d20-5",
				"dmg" : "1d4+5",
				"type" : "pierce",
				"notes" : "Super cool"
			},
			"bow" : {
				"atk" : "1d20+2",
				"dmg" : "6d6",
				"rng" : "30"
			}
		},
		"spells" : {
			"fireball": {
				"dmg" : "6d6",
				"uses" : 4
			},
			"healing_bolt" : {
				"heal" : "2d8+4",
				"uses" : 6
			}
		},
		"abilities" : ["pack tactics"],
		"items" : ['healing_potion', 'healing_potion', 'ring']
	}
}

var attrMod = function(attr){
	return Math.floor(attr/2) - 5;
}


var NaturalCrit = React.createClass({

	getInitialState: function() {
		var self = this;

		return {
			enemies: _.indexBy(_.map(encounter.enemies, function(type, index){
				return  self.createEnemy(type, index)
			}), 'id')
		};
	},

	createEnemy : function(type, index){
		var stats = MonsterManual[type]
		return _.extend({
			id : type + index,
			name : type,
			currentHP : stats.hp,
			initiative : _.random(1,20) + attrMod(stats.attr.dex)
		}, stats);
	},

	addPC : function(name, initiative){
		this.state.enemies[name] = {
			name : name,
			id : name,
			initiative : initiative,
			isPC : true
		};
		this.setState({
			enemies : this.state.enemies
		})

	},


	addRandomPC : function(){
		this.addPC(
			_.sample(['zatch', 'jasper', 'el toro', 'tulik']) + _.random(1,1000),
			_.random(1,25)
		)
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





	render : function(){
		var self = this;

		console.log();

		var sortedEnemies = _.sortBy(this.state.enemies, function(e){
			return -e.initiative;
		});


		var cards = _.map(sortedEnemies, function(enemy){
			return <MonsterCard
				{...enemy}
				key={enemy.id}
				updateHP={self.updateHP.bind(self, enemy.id)}
				remove={self.removeEnemy.bind(self, enemy.id)} />
		})



		return(
			<div className='naturalCrit'>
				<button className='rollInitiative' onClick={this.addRandomPC}> rollInitiative</button>
				Project Ready!


				{cards}

				<pre>
				{JSON.stringify(MonsterManual, null, '  ')}</pre>
			</div>
		);
	}
});

module.exports = NaturalCrit;


