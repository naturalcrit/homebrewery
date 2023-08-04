const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const features = [
	'Astrological Botany',   'Biochemical Sorcery',   'Civil Divination',
	'Consecrated Augury',    'Demonic Anthropology',  'Divinatory Mineralogy',
	'Exo Interfacer',        'Genetic Banishing',     'Gunpowder Torturer',
	'Gunslinger Corruptor',  'Hermetic Geography',    'Immunological Cultist',
	'Malefic Chemist',       'Mathematical Pharmacy', 'Nuclear Biochemistry',
	'Orbital Gravedigger',   'Pharmaceutical Outlaw', 'Phased Linguist',
	'Plasma Gunslinger',     'Police Necromancer',    'Ritual Astronomy',
	'Sixgun Poisoner',       'Seismological Alchemy', 'Spiritual Illusionism',
	'Statistical Occultism', 'Spell Analyst',         'Torque Interfacer'
];

const classnames = ['Ackerman', 'Berserker-Typist', 'Concierge', 'Fishmonger',
                    'Haberdasher', 'Manicurist', 'Netrunner', 'Weirkeeper'];

const levels = ['1st',  '2nd',  '3rd',  '4th',  '5th',
                '6th',  '7th',  '8th',  '9th',  '10th',
                '11th', '12th', '13th', '14th', '15th',
                '16th', '17th', '18th', '19th', '20th'];

const profBonus = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6];

module.exports = {
	non : function(snippetClasses){
		const classname = _.sample(classnames);

		return dedent`
		{{${snippetClasses}
		##### The ${classname}
		| Level | Proficiency | Features     |
		|      ^| Bonus      ^|             ^|
		|:-----:|:-----------:|:-------------|
		${
			_.map(levels, function(levelName, level){
				const res = [
					_.pad(levelName, 5),
					_.pad(`+${profBonus[level]}`, 2),
					_.padEnd(_.sample(features), 21),
				].join(' | ');
				return `| ${res} |`;
			}).join('\n')
		}
		}}\n\n`;
	},

	full : function(snippetClasses){
		const classname = _.sample(classnames);

		const cantripsKnown = [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
		const spells = [
			'2  | —  | —  | —  | —  | —  | —  | —  | — ',
			'3  | —  | —  | —  | —  | —  | —  | —  | — ',
			'4  | 2  | —  | —  | —  | —  | —  | —  | — ',
			'4  | 3  | —  | —  | —  | —  | —  | —  | — ',
			'4  | 3  | 2  | —  | —  | —  | —  | —  | — ',
			'4  | 3  | 3  | —  | —  | —  | —  | —  | — ',
			'4  | 3  | 3  | 1  | —  | —  | —  | —  | — ',
			'4  | 3  | 3  | 2  | —  | —  | —  | —  | — ',
			'4  | 3  | 3  | 2  | 1  | —  | —  | —  | — ',
			'4  | 3  | 3  | 2  | 1  | —  | —  | —  | — ',
			'4  | 3  | 3  | 2  | 1  | 1  | —  | —  | — ',
			'4  | 3  | 3  | 2  | 1  | 1  | —  | —  | — ',
			'4  | 3  | 3  | 2  | 1  | 1  | 1  | —  | — ',
			'4  | 3  | 3  | 2  | 1  | 1  | 1  | —  | — ',
			'4  | 3  | 3  | 2  | 1  | 1  | 1  | 1  | — ',
			'4  | 3  | 3  | 2  | 1  | 1  | 1  | 1  | — ',
			'4  | 3  | 3  | 2  | 1  | 1  | 1  | 1  | 1 ',
			'4  | 3  | 3  | 3  | 1  | 1  | 1  | 1  | 1 ',
			'4  | 3  | 3  | 3  | 2  | 2  | 1  | 1  | 1 ',
			'4  | 3  | 3  | 3  | 2  | 2  | 2  | 1  | 1 '
		];

		return dedent`
		{{${snippetClasses}
		##### The ${classname}
		| Level | Proficiency | Features     | Cantrips | --- Spell Slots Per Spell Level ---|||||||||
		|      ^| Bonus      ^|             ^| Known   ^|1st |2nd |3rd |4th |5th |6th |7th |8th |9th |
		|:-----:|:-----------:|:-------------|:--------:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
		${
			_.map(levels, function(level, idx){
				return `| ${_.pad(level, 5)} | +${profBonus[idx]} | ${_.padEnd(_.sample(features), 21)} | ${_.pad(cantripsKnown[idx], 8)} | ${spells[idx]} |`;
			}).join('\n')
		}
		}}\n\n`;
	},

	half : function(snippetClasses){
		const classname = _.sample(classnames);

		const spellsKnown = ['—', 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
		const spells = [
			'  —   |   —   |   —   |   —   |   —  ',
			'  2   |   —   |   —   |   —   |   —  ',
			'  3   |   —   |   —   |   —   |   —  ',
			'  3   |   —   |   —   |   —   |   —  ',
			'  4   |   2   |   —   |   —   |   —  ',
			'  4   |   2   |   —   |   —   |   —  ',
			'  4   |   3   |   —   |   —   |   —  ',
			'  4   |   3   |   —   |   —   |   —  ',
			'  4   |   3   |   2   |   —   |   —  ',
			'  4   |   3   |   2   |   —   |   —  ',
			'  4   |   3   |   3   |   —   |   —  ',
			'  4   |   3   |   3   |   —   |   —  ',
			'  4   |   3   |   3   |   1   |   —  ',
			'  4   |   3   |   3   |   1   |   —  ',
			'  4   |   3   |   3   |   2   |   —  ',
			'  4   |   3   |   3   |   2   |   —  ',
			'  4   |   3   |   3   |   3   |   1  ',
			'  4   |   3   |   3   |   3   |   1  ',
			'  4   |   3   |   3   |   3   |   2  ',
			'  4   |   3   |   3   |   3   |   2  '
		];

		return dedent`
		{{${snippetClasses}
		##### The ${classname}
		| Level | Proficiency | Features     | Spells |--- Spell Slots Per Spell Level ---|||||
		|      ^| Bonus      ^|             ^| Known ^|  1st  |  2nd  |  3rd  |  4th  |  5th  |
		|:-----:|:-----------:|:-------------|:------:|:-----:|:-----:|:-----:|:-----:|:-----:|
		${
			_.map(levels, function(level, idx){
				return `| ${_.pad(level, 5)} | +${profBonus[idx]} | ${_.padEnd(_.sample(features), 21)} | ${_.pad(spellsKnown[idx], 6)} | ${spells[idx]} |`;
			}).join('\n')
		}
		}}\n\n`;
	},

	third : function(snippetClasses){
		const classname = _.sample(classnames);

		const cantripsKnown = [2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
		const spellsKnown = [3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
		const spells = [
			'   2    |    —    |    —    |    —   ',
			'   3    |    —    |    —    |    —   ',
			'   3    |    —    |    —    |    —   ',
			'   3    |    —    |    —    |    —   ',
			'   4    |    2    |    —    |    —   ',
			'   4    |    2    |    —    |    —   ',
			'   4    |    2    |    —    |    —   ',
			'   4    |    3    |    —    |    —   ',
			'   4    |    3    |    —    |    —   ',
			'   4    |    3    |    —    |    —   ',
			'   4    |    3    |    2    |    —   ',
			'   4    |    3    |    2    |    —   ',
			'   4    |    3    |    2    |    —   ',
			'   4    |    3    |    3    |    —   ',
			'   4    |    3    |    3    |    —   ',
			'   4    |    3    |    3    |    —   ',
			'   4    |    3    |    3    |    1   ',
			'   4    |    3    |    3    |    1   '
		];

		return dedent`
		{{${snippetClasses}
		##### ${classname} Spellcasting
		| Level | Cantrips | Spells |--- Spells Slots per Spell Level ---||||
		|      ^| Known   ^| Known ^|   1st   |   2nd   |   3rd   |   4th   |
		|:-----:|:--------:|:------:|:-------:|:-------:|:-------:|:-------:|
		${
			_.map(levels.slice(2), function(level, idx){
				return `| ${_.pad(level, 5)} | ${_.pad(cantripsKnown[idx], 8)} | ${_.pad(spellsKnown[idx], 6)} | ${spells[idx]} |`;
			}).join('\n')
		}
		}}\n\n`;
	}
};
