var _ = require('lodash');

module.exports = function(classname){

	classname = classname || _.sample(['Archivist', 'Fancyman', 'Linguist', 'Fletcher',
			'Notary', 'Berserker-Typist', 'Fishmongerer', 'Manicurist', 'Haberdasher', 'Concierge'])

	var features = [
		"Astrological Botany",
		"Astrological Chemistry",
		"Biochemical Sorcery",
		"Civil Alchemy",
		"Consecrated Biochemistry",
		"Demonic Anthropology",
		"Divinatory Mineralogy",
		"Genetic Banishing",
		"Hermetic Geography",
		"Immunological Incantations",
		"Nuclear Illusionism",
		"Ritual Astronomy",
		"Seismological Divination",
		"Spiritual Biochemistry",
		"Statistical Occultism",
		"Police Necromancer",
		"Sixgun Poisoner",
		"Pharmaceutical Gunslinger",
		"Infernal Banker",
		"Spell Analyst",
		"Gunslinger Corruptor",
		"Torque Interfacer",
		"Exo Interfacer",
		"Gunpowder Torturer",
		"Orbital Gravedigger",
		"Phased Linguist",
		"Mathematical Pharmacist",
		"Plasma Outlaw",
		"Malefic Chemist",
		"Police Cultist"
	];

	var maxes = [4,3,3,3,3,2,2,1,1]
	var drawSlots = function(Slots){
		var slots = Number(Slots);
		return _.times(9, function(i){
			var max = maxes[i];
			if(slots < 1) return "—";
			var res = _.min([max, slots]);
			slots -= res;
			return res;
		}).join(' | ')
	}

	var extraWide = (_.random(0,1) === 0) ? "" : "___\n";

	var cantrips = 3;
	var spells = 1;
	var slots = 2;
	return "##### The " + classname + "\n" +
	"___\n" + extraWide +
	"| Level | Proficiency Bonus | Features | Cantrips Known | Spells Known | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |\n"+
	"|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n" +
	_.map(["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th"],function(levelName, level){
		var res = [
			levelName,
			"+" + Math.ceil(level/5 + 1),
			_.sample(features, _.sample([0,1,1])).join(', ') || "Ability Score Improvement",
			cantrips,
			spells,
			drawSlots(slots)
		].join(' | ');

		cantrips += _.random(0,1);
		spells += _.random(0,1);
		slots += _.random(0,2);

		return "| " + res + " |";
	}).join('\n') +'\n\n';

};