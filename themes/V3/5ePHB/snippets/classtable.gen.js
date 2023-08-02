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

module.exports = {
	non : function(classes){
		const classname = _.sample(classnames);

		return `{{${classes}\n##### The ${classname}\n` +
		`| Level | Proficiency | Features     |\n`+
		`|      ^| Bonus      ^|             ^|\n`+
		`|:-----:|:-----------:|:-------------|\n${
			_.map(levels, function(levelName, level){
				const res = [
					_.pad(levelName, 5),
					_.pad(`+${profBonus[level]}`, 2),
					_.padEnd(_.sample(features), 21),
				].join(' | ');
				return `| ${res} |`;
			}).join('\n')}\n}}\n\n`;
	},

	full : function(classes){
		const classname = _.sample(classnames);

		const cantripsKnown = [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
		const spells = [
			[2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
			['—', '—', 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			['—', '—', '—', '—', 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			['—', '—', '—', '—', '—', '—', 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3],
			['—', '—', '—', '—', '—', '—', '—', '—', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
			['—', '—', '—', '—', '—', '—', '—', '—', '—', '—', 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
			['—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', 1, 1, 1, 1, 1, 1, 1, 2],
			['—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', 1, 1, 1, 1, 1, 1],
			['—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', 1, 1, 1, 1],
		];

		return `{{${classes}\n##### The ${classname}\n` +
		`| Level | Proficiency | Features     | Cantrips | --- Spell Slots Per Spell Level ---|||||||||\n`+
		`|      ^| Bonus      ^|             ^| Known   ^|1st |2nd |3rd |4th |5th |6th |7th |8th |9th |\n`+
		`|:-----:|:-----------:|:-------------|:--------:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|\n${
			_.map(levels, function(levelName, level){
				const res = [
					_.pad(levelName, 5),
					_.pad(`+${profBonus[level]}`, 2),
					_.padEnd(_.sample(features), 21),
					_.pad(cantripsKnown[level].toString(), 8),
					spells.map((spellList)=>{
						return _.pad(spellList[level].toString(), 2);
					}).join(' | '),
				].join(' | ');
				return `| ${res} |`;
			}).join('\n')}\n}}\n\n`;
	},

	half : function(classes){
		const classname = _.sample(classnames);

		const spellsKnown = ['—', 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
		const spells = [
			['—', 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
			['—', '—', '—', '—', 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			['—', '—', '—', '—', '—', '—', '—', '—', 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			['—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', 1, 1, 2, 2, 3, 3, 3, 3],
			['—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', 1, 1, 2, 2],
		];

		return `{{${classes}\n##### The ${classname}\n` +
		`| Level | Proficiency | Features     | Spells | --- Spell Slots Per Spell Level ---|||||\n`+
		`|      ^| Bonus      ^|             ^| Known ^|1st |2nd |3rd |4th |5th |\n`+
		`|:-----:|:-----------:|:-------------|:------:|:--:|:--:|:--:|:--:|:--:|\n${
			_.map(levels, function(levelName, level){
				const res = [
					_.pad(levelName, 5),
					_.pad(`+${profBonus[level]}`, 2),
					_.padEnd(_.sample(features), 21),
					_.pad(spellsKnown[level].toString(), 6),
					spells.map((spellList)=>{
						return _.pad(spellList[level].toString(), 2);
					}).join(' | '),
				].join(' | ');
				return `| ${res} |`;
			}).join('\n')}\n}}\n\n`;
	},

	third : function(classes){
		const classname = _.sample(classnames);

		const thirdLevels = levels.slice(2);
		const cantripsKnown = [2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
		const spellsKnown = [3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
		const spells = [
			[2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
			['—', '—', '—', '—', 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			['—', '—', '—', '—', '—', '—', '—', '—', '—', '—', 2, 2, 2, 3, 3, 3, 3, 3],
			['—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', 1, 1],
		];

		return `{{${classes}\n##### ${classname} Spellcasting\n` +
		`| Level | Cantrips | Spells |--- Spells Slots per Spell Level ---||||\n` +
		`|      ^| Known   ^| Known ^|   1st   |   2nd   |   3rd   |   4th   |\n` +
		`|:-----:|:--------:|:------:|:-------:|:-------:|:-------:|:-------:|\n${
			_.map(thirdLevels, function(levelName, level){
				const res = [
					_.pad(levelName, 5),
					_.pad(cantripsKnown[level].toString(), 8),
					_.pad(spellsKnown[level].toString(), 6),
					spells.map((spellList)=>{
						return _.pad(spellList[level].toString(), 7);
					}).join(' | '),
				].join(' | ');
				return `| ${res} |`;
			}).join('\n')}\n}}\n\n`;
	}
};
