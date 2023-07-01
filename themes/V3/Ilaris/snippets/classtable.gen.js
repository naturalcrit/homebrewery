const _ = require('lodash');

const features = [
	'Astrological Botany',
	'Biochemical Sorcery',
	'Civil Divination',
	'Consecrated Augury',
	'Demonic Anthropology',
	'Divinatory Mineralogy',
	'Exo Interfacer',
	'Genetic Banishing',
	'Gunpowder Torturer',
	'Gunslinger Corruptor',
	'Hermetic Geography',
	'Immunological Cultist',
	'Malefic Chemist',
	'Mathematical Pharmacy',
	'Nuclear Biochemistry',
	'Orbital Gravedigger',
	'Pharmaceutical Outlaw',
	'Phased Linguist',
	'Plasma Gunslinger',
	'Police Necromancer',
	'Ritual Astronomy',
	'Sixgun Poisoner',
	'Seismological Alchemy',
	'Spiritual Illusionism',
	'Statistical Occultism',
	'Spell Analyst',
	'Torque Interfacer'
];

const classnames = ['Ackerman', 'Berserker-Typist', 'Concierge', 'Fishmonger',
	                  'Haberdasher', 'Manicurist', 'Netrunner', 'Weirkeeper'];

const levels = ['1st', '2nd', '3rd', '4th', '5th',
              	'6th', '7th', '8th', '9th', '10th',
	              '11th', '12th', '13th', '14th', '15th',
              	'16th', '17th', '18th', '19th', '20th'];

const profBonus = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6];

const maxes = [4, 3, 3, 3, 3, 2, 2, 1, 1];

const drawSlots = function(Slots, rows, padding){
	let slots = Number(Slots);
	return _.times(rows, function(i){
		const max = maxes[i];
		if(slots < 1) return _.pad('—', padding);
		const res = _.min([max, slots]);
		slots -= res;
		return _.pad(res.toString(), padding);
	}).join(' | ');
};

module.exports = {
	full : function(classes){
		const classname = _.sample(classnames);


		let cantrips = 3;
		let spells = 1;
		let slots = 2;
		return `{{${classes}\n##### The ${classname}\n` +
		`| Level | Proficiency | Features     | Cantrips | Spells | --- Spell Slots Per Spell Level ---|||||||||\n`+
		`|      ^| Bonus      ^|             ^| Known   ^| Known ^|1st |2nd |3rd |4th |5th |6th |7th |8th |9th |\n`+
		`|:-----:|:-----------:|:-------------|:--------:|:------:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|\n${
			_.map(levels, function(levelName, level){
				const res = [
					_.pad(levelName, 5),
					_.pad(`+${profBonus[level]}`, 2),
					_.padEnd(_.sample(features), 21),
					_.pad(cantrips.toString(), 8),
					_.pad(spells.toString(), 6),
					drawSlots(slots, 9, 2),
				].join(' | ');

				cantrips += _.random(0, 1);
				spells += _.random(0, 1);
				slots += _.random(0, 2);

				return `| ${res} |`;
			}).join('\n')}\n}}\n\n`;
	},

	half : function(classes){
		const classname =  _.sample(classnames);

		let featureScore = 1;
		return `{{${classes}\n##### The ${classname}\n` +
		`| Level | Proficiency Bonus | Features | ${_.pad(_.sample(features), 21)} |\n` +
		`|:-----:|:-----------------:|:---------|:---------------------:|\n${
			_.map(levels, function(levelName, level){
				const res = [
					_.pad(levelName, 5),
					_.pad(`+${profBonus[level]}`, 2),
					_.padEnd(_.sample(features), 23),
					_.pad(`+${featureScore}`, 21),
				].join(' | ');

				featureScore += _.random(0, 1);

				return `| ${res} |`;
			}).join('\n')}\n}}\n\n`;
	},

	third : function(classes){
		const classname = _.sample(classnames);

		let cantrips = 3;
		let spells = 1;
		let slots = 2;
		return `{{${classes}\n##### ${classname} Spellcasting\n` +
		`| Class  | Cantrips | Spells  |--- Spells Slots per Spell Level ---||||\n` +
		`| Level ^| Known   ^| Known  ^|   1st   |   2nd   |   3rd   |   4th   |\n` +
		`|:------:|:--------:|:-------:|:-------:|:-------:|:-------:|:-------:|\n${
			_.map(levels, function(levelName, level){
				const res = [
					_.pad(levelName, 6),
					_.pad(cantrips.toString(), 8),
					_.pad(spells.toString(), 7),
					drawSlots(slots, 4, 7),
				].join(' | ');

				cantrips += _.random(0, 1);
				spells += _.random(0, 1);
				slots += _.random(0, 1);

				return `| ${res} |`;
			}).join('\n')}\n}}\n\n`;
	}
};
