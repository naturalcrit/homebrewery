const _ = require('lodash');

const spellNames = [
	'Astral Rite of Acne',
	'Create Acne',
	'Cursed Ramen Erruption',
	'Dark Chant of the Dentists',
	'Erruption of Immaturity',
	'Flaming Disc of Inconvenience',
	'Heal Bad Hygene',
	'Heavenly Transfiguration of the Cream Devil',
	'Hellish Cage of Mucus',
	'Irritate Peanut Butter Fairy',
	'Luminous Erruption of Tea',
	'Mystic Spell of the Poser',
	'Sorcerous Enchantment of the Chimneysweep',
	'Steak Sauce Ray',
	'Talk to Groupie',
	'Astonishing Chant of Chocolate',
	'Astounding Pasta Puddle',
	'Ball of Annoyance',
	'Cage of Yarn',
	'Control Noodles Elemental',
	'Create Nervousness',
	'Cure Baldness',
	'Cursed Ritual of Bad Hair',
	'Dispell Piles in Dentist',
	'Eliminate Florists',
	'Illusionary Transfiguration of the Babysitter',
	'Necromantic Armor of Salad Dressing',
	'Occult Transfiguration of Foot Fetish',
	'Protection from Mucus Giant',
	'Tinsel Blast',
	'Alchemical Evocation of the Goths',
	'Call Fangirl',
	'Divine Spell of Crossdressing',
	'Dominate Ramen Giant',
	'Eliminate Vindictiveness in Gym Teacher',
	'Extra-Planar Spell of Irritation',
	'Induce Whining in Babysitter',
	'Invoke Complaining',
	'Magical Enchantment of Arrogance',
	'Occult Globe of Salad Dressing',
	'Overwhelming Enchantment of the Chocolate Fairy',
	'Sorcerous Dandruff Globe',
	'Spiritual Invocation of the Costumers',
	'Ultimate Rite of the Confetti Angel',
	'Ultimate Ritual of Mouthwash',
];

module.exports = {

	spellList : function(){
		const levels = ['Cantrips (0 Level)', '1st Level', '2nd Level', '3rd Level', '4th Level', '5th Level', '6th Level', '7th Level', '8th Level', '9th Level'];

		const content = _.map(levels, (level)=>{
			const spells = _.map(_.sampleSize(spellNames, _.random(5, 15)), (spell)=>{
				return `- ${spell}`;
			}).join('\n');
			return `##### ${level} \n${spells} \n`;
		}).join('\n');

		return `<div class='spellList'>\n${content}\n</div>`;
	},

	spell : function(){
		const level = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
		const spellSchools = ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation'];


		let components = _.sampleSize(['V', 'S', 'M'], _.random(1, 3)).join(', ');
		if(components.indexOf('M') !== -1){
			components += ` (${_.sampleSize(['a small doll', 'a crushed button worth at least 1cp', 'discarded gum wrapper'], _.random(1, 3)).join(', ')})`;
		}

		return [
			`#### ${_.sample(spellNames)}`,
			`*${_.sample(level)}-level ${_.sample(spellSchools)}*`,
			'___',
			'- **Casting Time:** 1 action',
			`- **Range:** ${_.sample(['Self', 'Touch', '30 feet', '60 feet'])}`,
			`- **Components:** ${components}`,
			`- **Duration:** ${_.sample(['Until dispelled', '1 round', 'Instantaneous', 'Concentration, up to 10 minutes', '1 hour'])}`,
			'',
			'A flame, equivalent in brightness to a torch, springs from an object that you touch. ',
			'The effect look like a regular flame, but it creates no heat and doesn\'t use oxygen. ',
			'A *continual flame* can be covered or hidden but not smothered or quenched.',
			'\n\n\n'
		].join('\n');
	}
};
