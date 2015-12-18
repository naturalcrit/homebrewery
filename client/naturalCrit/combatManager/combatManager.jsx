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
		unique : {
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

var defaultMonsterManual = require('naturalCrit/defaultMonsterManual.js');

var attrMod = function(attr){
	return Math.floor(attr/2) - 5;
}


var Store = require('naturalCrit/combat.store');
var Actions = require('naturalCrit/combat.actions');



var CombatManager = React.createClass({
	mixins : [Store.mixin()],


		getInitialState: function() {
			var self = this;
			return {
				selectedEncounterIndex : 0,
				encounters : JSON.parse(localStorage.getItem('encounters')) || encounters,
				monsterManual : JSON.parse(localStorage.getItem('monsterManual')) || defaultMonsterManual,

				players : localStorage.getItem('players') || 'jasper 13\nzatch 19',


			};
		},

		onStoreChange : function(){
			console.log('STORE CAHNGE', Store.getInc());
			this.setState({
				inc : Store.getInc()
			})
		},


		handleEncounterJSONChange : function(encounterIndex, json){
			this.state.encounters[encounterIndex] = json;
			this.setState({
				encounters : this.state.encounters
			})
			localStorage.setItem("encounters", JSON.stringify(this.state.encounters));
		},
		handleMonsterManualJSONChange : function(json){
			this.setState({
				monsterManual : json
			});
			localStorage.setItem("monsterManual", JSON.stringify(this.state.monsterManual));
		},
		handlePlayerChange : function(e){
			this.setState({
				players : e.target.value
			});
			localStorage.setItem("players", e.target.value);
		},
		handleSelectedEncounterChange : function(encounterIndex){
			console.log(encounterIndex);
			this.setState({
				selectedEncounterIndex : encounterIndex
			});
		},
		handleRemoveEncounter : function(encounterIndex){
			this.state.encounters.splice(encounterIndex, 1);
			this.setState({
				encounters : this.state.encounters
			});
			localStorage.setItem("encounters", JSON.stringify(this.state.encounters));
		},

		renderSelectedEncounter : function(){
			var self = this;

			if(this.state.selectedEncounterIndex != null && this.state.encounters[this.state.selectedEncounterIndex]){
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

		temp : function(){
			Actions.setInc(++this.state.inc);
		},


		render : function(){
			var self = this;
			return(
				<div className='combatManager'>
					<Sidebar
						selectedEncounter={this.state.selectedEncounterIndex}
						encounters={this.state.encounters}
						monsterManual={this.state.monsterManual}
						players={this.state.players}

						onSelectEncounter={this.handleSelectedEncounterChange}
						onRemoveEncounter={this.handleRemoveEncounter}
						onJSONChange={this.handleEncounterJSONChange}
						onMonsterManualChange={this.handleMonsterManualJSONChange}
						onPlayerChange={this.handlePlayerChange}
					/>


					{this.renderSelectedEncounter()}

					<button onClick={this.temp}>YUP {this.state.inc}</button>

				</div>
			);
		}
});

module.exports = CombatManager;
