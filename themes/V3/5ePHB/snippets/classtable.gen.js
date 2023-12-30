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
].map((f)=>_.padEnd(f, 21)); // Pad to equal length of 21 chars long

const classnames = [
	'Ackerman', 'Berserker-Typist', 'Concierge', 'Fishmonger',
	'Haberdasher', 'Manicurist', 'Netrunner', 'Weirkeeper'
];

module.exports = {
	non : function(snippetClasses){
		return dedent`
		{{${snippetClasses}
		##### The ${_.sample(classnames)}
		| Level | Proficiency Bonus | Features | ${_.sample(features)} |
		|:-----:|:-----------------:|:---------|:---------------------:|
		|  1st  |  +2  | ${_.sample(features)} |          2            |
		|  2nd  |  +2  | ${_.sample(features)} |          2            |
		|  3rd  |  +2  | ${_.sample(features)} |          3            |
		|  4th  |  +2  | ${_.sample(features)} |          3            |
		|  5th  |  +3  | ${_.sample(features)} |          3            |
		|  6th  |  +3  | ${_.sample(features)} |          4            |
		|  7th  |  +3  | ${_.sample(features)} |          4            |
		|  8th  |  +3  | ${_.sample(features)} |          4            |
		|  9th  |  +4  | ${_.sample(features)} |          4            |
		| 10th  |  +4  | ${_.sample(features)} |          4            |
		| 11th  |  +4  | ${_.sample(features)} |          4            |
		| 12th  |  +4  | ${_.sample(features)} |          5            |
		| 13th  |  +5  | ${_.sample(features)} |          5            |
		| 14th  |  +5  | ${_.sample(features)} |          5            |
		| 15th  |  +5  | ${_.sample(features)} |          5            |
		| 16th  |  +5  | ${_.sample(features)} |          5            |
		| 17th  |  +6  | ${_.sample(features)} |          6            |
		| 18th  |  +6  | ${_.sample(features)} |          6            |
		| 19th  |  +6  | ${_.sample(features)} |          6            |
		| 20th  |  +6  | ${_.sample(features)} |      unlimited        |
		}}\n\n`;
	},

	full : function(snippetClasses){
		return dedent`
		{{${snippetClasses}
		##### The ${_.sample(classnames)}
		| Level | Proficiency | Features     | Cantrips | --- Spell Slots Per Spell Level ---|||||||||
		|      ^| Bonus      ^|             ^| Known   ^|1st |2nd |3rd |4th |5th |6th |7th |8th |9th |
		|:-----:|:-----------:|:-------------|:--------:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
		|  1st  | +2 | ${_.sample(features)} |    2     | 2  | —  | —  | —  | —  | —  | —  | —  | —  |
		|  2nd  | +2 | ${_.sample(features)} |    2     | 3  | —  | —  | —  | —  | —  | —  | —  | —  |
		|  3rd  | +2 | ${_.sample(features)} |    2     | 4  | 2  | —  | —  | —  | —  | —  | —  | —  |
		|  4th  | +2 | ${_.sample(features)} |    3     | 4  | 3  | —  | —  | —  | —  | —  | —  | —  |
		|  5th  | +3 | ${_.sample(features)} |    3     | 4  | 3  | 2  | —  | —  | —  | —  | —  | —  |
		|  6th  | +3 | ${_.sample(features)} |    3     | 4  | 3  | 3  | —  | —  | —  | —  | —  | —  |
		|  7th  | +3 | ${_.sample(features)} |    3     | 4  | 3  | 3  | 1  | —  | —  | —  | —  | —  |
		|  8th  | +3 | ${_.sample(features)} |    3     | 4  | 3  | 3  | 2  | —  | —  | —  | —  | —  |
		|  9th  | +4 | ${_.sample(features)} |    3     | 4  | 3  | 3  | 2  | 1  | —  | —  | —  | —  |
		| 10th  | +4 | ${_.sample(features)} |    3     | 4  | 3  | 3  | 2  | 1  | —  | —  | —  | —  |
		| 11th  | +4 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 2  | 1  | 1  | —  | —  | —  |
		| 12th  | +4 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 2  | 1  | 1  | —  | —  | —  |
		| 13th  | +5 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 2  | 1  | 1  | 1  | —  | —  |
		| 14th  | +5 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 2  | 1  | 1  | 1  | —  | —  |
		| 15th  | +5 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 2  | 1  | 1  | 1  | 1  | —  |
		| 16th  | +5 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 2  | 1  | 1  | 1  | 1  | —  |
		| 17th  | +6 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 2  | 1  | 1  | 1  | 1  | 1  |
		| 18th  | +6 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 3  | 1  | 1  | 1  | 1  | 1  |
		| 19th  | +6 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 3  | 2  | 2  | 1  | 1  | 1  |
		| 20th  | +6 | ${_.sample(features)} |    4     | 4  | 3  | 3  | 3  | 2  | 2  | 2  | 1  | 1  |
		}}\n\n`;
	},

	half : function(snippetClasses){
		return dedent`
		{{${snippetClasses}
		##### The ${_.sample(classnames)}
		| Level | Proficiency | Features     | Spells |--- Spell Slots Per Spell Level ---|||||
		|      ^| Bonus      ^|             ^| Known ^|  1st  |  2nd  |  3rd  |  4th  |  5th  |
		|:-----:|:-----------:|:-------------|:------:|:-----:|:-----:|:-----:|:-----:|:-----:|
		|  1st  | +2 | ${_.sample(features)} |   —    |   —   |   —   |   —   |   —   |   —   |
		|  2nd  | +2 | ${_.sample(features)} |   2    |   2   |   —   |   —   |   —   |   —   |
		|  3rd  | +2 | ${_.sample(features)} |   3    |   3   |   —   |   —   |   —   |   —   |
		|  4th  | +2 | ${_.sample(features)} |   3    |   3   |   —   |   —   |   —   |   —   |
		|  5th  | +3 | ${_.sample(features)} |   4    |   4   |   2   |   —   |   —   |   —   |
		|  6th  | +3 | ${_.sample(features)} |   4    |   4   |   2   |   —   |   —   |   —   |
		|  7th  | +3 | ${_.sample(features)} |   5    |   4   |   3   |   —   |   —   |   —   |
		|  8th  | +3 | ${_.sample(features)} |   5    |   4   |   3   |   —   |   —   |   —   |
		|  9th  | +4 | ${_.sample(features)} |   6    |   4   |   3   |   2   |   —   |   —   |
		| 10th  | +4 | ${_.sample(features)} |   6    |   4   |   3   |   2   |   —   |   —   |
		| 11th  | +4 | ${_.sample(features)} |   7    |   4   |   3   |   3   |   —   |   —   |
		| 12th  | +4 | ${_.sample(features)} |   7    |   4   |   3   |   3   |   —   |   —   |
		| 13th  | +5 | ${_.sample(features)} |   8    |   4   |   3   |   3   |   1   |   —   |
		| 14th  | +5 | ${_.sample(features)} |   8    |   4   |   3   |   3   |   1   |   —   |
		| 15th  | +5 | ${_.sample(features)} |   9    |   4   |   3   |   3   |   2   |   —   |
		| 16th  | +5 | ${_.sample(features)} |   9    |   4   |   3   |   3   |   2   |   —   |
		| 17th  | +6 | ${_.sample(features)} |   10   |   4   |   3   |   3   |   3   |   1   |
		| 18th  | +6 | ${_.sample(features)} |   10   |   4   |   3   |   3   |   3   |   1   |
		| 19th  | +6 | ${_.sample(features)} |   11   |   4   |   3   |   3   |   3   |   2   |
		| 20th  | +6 | ${_.sample(features)} |   11   |   4   |   3   |   3   |   3   |   2   |
		}}\n\n`;
	},

	third : function(snippetClasses){
		return dedent`
		{{${snippetClasses}
		##### ${_.sample(classnames)} Spellcasting
		| Level | Cantrips | Spells |--- Spells Slots per Spell Level ---||||
		|      ^| Known   ^| Known ^|   1st   |   2nd   |   3rd   |   4th   |
		|:-----:|:--------:|:------:|:-------:|:-------:|:-------:|:-------:|
		|  3rd  |    2     |   3    |    2    |    —    |    —    |    —    |
		|  4th  |    2     |   4    |    3    |    —    |    —    |    —    |
		|  5th  |    2     |   4    |    3    |    —    |    —    |    —    |
		|  6th  |    2     |   4    |    3    |    —    |    —    |    —    |
		|  7th  |    2     |   5    |    4    |    2    |    —    |    —    |
		|  8th  |    2     |   6    |    4    |    2    |    —    |    —    |
		|  9th  |    2     |   6    |    4    |    2    |    —    |    —    |
		| 10th  |    3     |   7    |    4    |    3    |    —    |    —    |
		| 11th  |    3     |   8    |    4    |    3    |    —    |    —    |
		| 12th  |    3     |   8    |    4    |    3    |    —    |    —    |
		| 13th  |    3     |   9    |    4    |    3    |    2    |    —    |
		| 14th  |    3     |   10   |    4    |    3    |    2    |    —    |
		| 15th  |    3     |   10   |    4    |    3    |    2    |    —    |
		| 16th  |    3     |   11   |    4    |    3    |    3    |    —    |
		| 17th  |    3     |   11   |    4    |    3    |    3    |    —    |
		| 18th  |    3     |   11   |    4    |    3    |    3    |    —    |
		| 19th  |    3     |   12   |    4    |    3    |    3    |    1    |
		| 20th  |    3     |   13   |    4    |    3    |    3    |    1    |
		}}\n\n`;
	}
};
