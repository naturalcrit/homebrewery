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
			players : '',
			unique : {},

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


	getPlayerObjects : function(){
		return _.reduce(this.props.players.split('\n'), function(r, line){
			var parts = line.split(' ');
			if(parts.length != 2) return r;
			r.push({
				name : parts[0],
				initiative : parts[1] * 1,
				isPC : true
			})
			return r;
		},[])
	},


	renderEnemies : function(){
		var self = this;

		var sortedEnemies = _.sortBy(_.union(_.values(this.state.enemies), this.getPlayerObjects()), function(e){
			if(e && e.initiative) return -e.initiative;
			return 0;
		});

		return _.map(sortedEnemies, function(enemy){
			if(enemy.isPC){
				return <PlayerCard {...enemy} key={enemy.name} />
			}

			return <MonsterCard
				{...enemy}
				key={enemy.id}
				updateHP={self.updateHP.bind(self, enemy.id)}
				remove={self.removeEnemy.bind(self, enemy.id)}
			/>
		})
	},

	render : function(){
		var self = this;

		var reward;
		if(this.props.reward){
			reward = <div className='reward'>
				<i className='fa fa-trophy' /> Rewards: {this.props.reward}
			</div>
		}

		return(
			<div className='mainEncounter'>
				<div className='info'>
					<h1>{this.props.name}</h1>
					<p>{this.props.desc}</p>
					{reward}
				</div>

				<div className='cardContainer'>
					{this.renderEnemies()}
				</div>
			</div>
		);
	}
});

module.exports = Encounter;


var PlayerCard = React.createClass({

	getDefaultProps: function() {
		return {
			name : '',
			initiative : 0
		};
	},
	render : function(){
		return <div className='playerCard'>
			<span className='name'>{_.startCase(this.props.name)}</span>
			<span className='initiative'><i className='fa fa-hourglass-2'/>{this.props.initiative}</span>
		</div>
	},

})