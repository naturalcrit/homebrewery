var React = require('react');
var _ = require('lodash');
var cx = require('classnames');


var Sidebar = require('./sidebar/sidebar.jsx');

var Encounter = require('./encounter/encounter.jsx');


var encounters = [
	{
		name : 'The Big Bad',
		desc : 'The big fight!',
		reward : 'gems',
		enemies : ['goblin', 'goblin'],
		reserve : ['goblin'],
	},
	{
		name : 'Demon Goats',
		desc : 'Gross fight',
		reward : 'curved horn, goat sac',
		enemies : ['demon_goat', 'demon_goat', 'demon_goat'],
		index : {
			demon_goat : {
				"hp" : 140,
				"ac" : 16,
				"attr" : {
					"str" : 8,
					"con" : 8,
					"dex" : 8,
					"int" : 8,
					"wis" : 8,
					"cha" : 8
				},
				"attacks" : {
					"charge" : {
						"atk" : "1d20+5",
						"dmg" : "1d8+5",
						"type" : "bludge"
					}
				},
				"abilities" : ["charge"],
			}
		}
	},

];

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

			selectedEncounterIndex : 0,

			encounters : encounters,
			monsterManual : MonsterManual,

			players : 'jasper 13'

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



	handleJSONChange : function(encounterIndex, json){
		this.state.encounters[encounterIndex] = json;
		this.setState({
			encounters : this.state.encounters
		})
	},
	handleEncounterChange : function(encounterIndex){
		this.setState({
			selectedEncounterIndex : encounterIndex
		});
	},
	handlePlayerChange : function(e){
		this.setState({
			players : e.target.value
		});
	},


	renderSelectedEncounter : function(){
		var self = this;
		var selectedEncounter = _.find(this.state.encounters, function(encounter){
			return encounter.name == self.state.selectedEncounter;
		});

		if(this.state.selectedEncounterIndex != null){
			var selectedEncounter = this.state.encounters[this.state.selectedEncounterIndex]
			return <Encounter
				key={selectedEncounter.name}
				{...selectedEncounter}
				monsterManual={this.state.monsterManual}
				players={this.state.players}
			/>
		}

		return null;
	},


	render : function(){
		var self = this;

		console.log(this.state.encounters);

		return(
			<div className='naturalCrit'>
				<Sidebar
					selectedEncounter={this.state.selectedEncounterIndex}
					encounters={this.state.encounters}
					monsterManual={this.state.monsterManual}
					players={this.state.players}

					onSelectEncounter={this.handleEncounterChange}
					onJSONChange={this.handleJSONChange}
					onPlayerChange={this.handlePlayerChange}
				/>


					{this.renderSelectedEncounter()}

			</div>
		);
	}
});

module.exports = NaturalCrit;


