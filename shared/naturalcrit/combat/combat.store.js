var flux = require('pico-flux');
var _ = require('lodash');

var defaultMonsterManual = require('naturalcrit/defaultMonsterManual.js');
var GetRandomEncounter = require('naturalcrit/randomEncounter.js');

var Store = {
	selectedEncounterIndex : 0,
	encounters : JSON.parse(localStorage.getItem('encounters')) || [GetRandomEncounter()],
	monsterManual : JSON.parse(localStorage.getItem('monsterManual')) || defaultMonsterManual,
	players : localStorage.getItem('players') || 'jasper 13\nzatch 19',
};


module.exports = flux.createStore({
	UDPATE_MONSTER_MANUAL : function(json){
		Store.monsterManual = json;
		return true;
	},
	ADD_ENCOUNTER : function(){
		Store.encounters.push(GetRandomEncounter());
		return true;
	},
	UPDATE_ENCOUNTER : function(index, json){
		Store.encounters[index] = json;
		return true;
	},
	REMOVE_ENCOUNTER : function(index){
		Store.encounters.splice(index, 1);
		return true;
	},
	UPDATE_PLAYERS : function(text){
		Store.players = text;
		return true;
	},
	SELECT_ENCOUNTER : function(index){
		Store.selectedEncounterIndex = index;
		return true;
	},

},{
	getMonsterManual : function(){
		return Store.monsterManual;
	},
	getSelectedEncounterIndex : function(){
		return Store.selectedEncounterIndex;
	},
	getSelectedEncounter : function(){
		return Store.encounters[Store.selectedEncounterIndex];
	},
	getEncounter : function(index){
		return Store.encounters[index];
	},
	getEncounters : function(index){
		return Store.encounters;
	},
	getPlayersText : function(){
		return Store.players;
	},
	getPlayers : function(){
		return _.reduce(Store.players.split('\n'), function(r, line){
			var idx = line.lastIndexOf(' ');
			if(idx !== -1){
				r[line.substring(0, idx)] = line.substring(idx)*1;
			}
			return r;
		}, {})
	},
})