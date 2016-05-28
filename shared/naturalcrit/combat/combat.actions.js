var dispatch = require('pico-flux').dispatch;

module.exports = {
	updateMonsterManual : function(json){
		dispatch('UDPATE_MONSTER_MANUAL', json);
	},
	addEncounter : function(){
		dispatch('ADD_ENCOUNTER');
	},
	updateEncounter : function(index, json){
		dispatch('UPDATE_ENCOUNTER', index, json);
	},
	removeEncounter : function(index){
		dispatch('REMOVE_ENCOUNTER', index);
	},
	updatePlayers : function(text){
		dispatch('UPDATE_PLAYERS', text);
	},
	selectEncounter : function(index){
		dispatch('SELECT_ENCOUNTER', index);
	},

}