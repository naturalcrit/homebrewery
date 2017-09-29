var _ = require('lodash');

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

var classnames = ['Archivist', 'Fancyman', 'Linguist', 'Fletcher',
				'Notary', 'Berserker-Typist', 'Fishmongerer', 'Manicurist', 'Haberdasher', 'Concierge'];

var levels = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th"]

var profBonus = [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];

var getFeature = (level)=>{
	var res = []
	if(_.includes([4,6,8,12,14,16,19], level+1)){
		res = ["Ability Score Improvement"]
	}
	res = _.union(res, _.sampleSize(features, _.sample([0,1,1,1,1,1])));
	if(!res.length) return "─";
	return res.join(', ');
}

module.exports = {
	full : function(){
		var classname = _.sample(classnames)

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


		var cantrips = 3;
		var spells = 1;
		var slots = 2;
		return "<div class='classTable wide'>\n##### The " + classname + "\n" +
		"| Level | Proficiency Bonus | Features | Cantrips Known | Spells Known | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |\n"+
		"|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n" +
		_.map(levels, function(levelName, level){
			var res = [
				levelName,
				"+" + profBonus[level],
				getFeature(level),
				cantrips,
				spells,
				drawSlots(slots)
			].join(' | ');

			cantrips += _.random(0,1);
			spells += _.random(0,1);
			slots += _.random(0,2);

			return "| " + res + " |";
		}).join('\n') +'\n</div>\n\n';
	},

	half : function(){
		var classname =  _.sample(classnames)

		var featureScore = 1
		return "<div class='classTable'>\n##### The " + classname + "\n" +
		"| Level | Proficiency Bonus | Features | " + _.sample(features) + "|\n" +
		"|:---:|:---:|:---|:---:|\n" +
		_.map(levels, function(levelName, level){
			var res = [
				levelName,
				"+" + profBonus[level],
				getFeature(level),
				"+" + featureScore
			].join(' | ');

			featureScore += _.random(0,1);

			return "| " + res + " |";
		}).join('\n') +'\n</div>\n\n';
	}
};