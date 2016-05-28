var _ = require('lodash');

module.exports = function(){


	var spellNames = [
		"Astral Rite of Acne",
		"Create Acne",
		"Cursed Ramen Erruption",
		"Dark Chant of the Dentists",
		"Erruption of Immaturity",
		"Flaming Disc of Inconvenience",
		"Heal Bad Hygene",
		"Heavenly Transfiguration of the Cream Devil",
		"Hellish Cage of Mucus",
		"Irritate Peanut Butter Fairy",
		"Luminous Erruption of Tea",
		"Mystic Spell of the Poser",
		"Sorcerous Enchantment of the Chimneysweep",
		"Steak Sauce Ray",
		"Talk to Groupie",
		"Astonishing Chant of Chocolate",
		"Astounding Pasta Puddle",
		"Ball of Annoyance",
		"Cage of Yarn",
		"Control Noodles Elemental",
		"Create Nervousness",
		"Cure Baldness",
		"Cursed Ritual of Bad Hair",
		"Dispell Piles in Dentist",
		"Eliminate Florists",
		"Illusionary Transfiguration of the Babysitter",
		"Necromantic Armor of Salad Dressing",
		"Occult Transfiguration of Foot Fetish",
		"Protection from Mucus Giant",
		"Tinsel Blast",
		"Alchemical Evocation of the Goths",
		"Call Fangirl",
		"Divine Spell of Crossdressing",
		"Dominate Ramen Giant",
		"Eliminate Vindictiveness in Gym Teacher",
		"Extra-Planar Spell of Irritation",
		"Induce Whining in Babysitter",
		"Invoke Complaining",
		"Magical Enchantment of Arrogance",
		"Occult Globe of Salad Dressing",
		"Overwhelming Enchantment of the Chocolate Fairy",
		"Sorcerous Dandruff Globe",
		"Spiritual Invocation of the Costumers",
		"Ultimate Rite of the Confetti Angel",
		"Ultimate Ritual of Mouthwash",
	];


	var level = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
	var spellSchools = ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"];


	var components = _.sampleSize(["V", "S", "M"], _.random(1,3)).join(', ');
	if(components.indexOf("M") !== -1){
		components += " (" +  _.sampleSize(['a small doll', 'a crushed button worth at least 1cp', 'discarded gum wrapper'], _.random(1,3)).join(', ') + ")"
	}

	return [
		"#### " + _.sample(spellNames),
		"*" + _.sample(level) + "-level " + _.sample(spellSchools) + "*",
		"___",
		"- **Casting Time:** 1 action",
		"- **Range:** " + _.sample(["Self", "Touch", "30 feet", "60 feet"]),
		"- **Components:** " + components,
		"- **Duration:** " + _.sample(["Until dispelled", "1 round", "Instantaneous", "Concentration, up to 10 minutes", "1 hour"]),
		"",
		"A flame, equivalent in brightness to a torch, springs from from an object that you touch. ",
		"The effect look like a regular flame, but it creates no heat and doesn't use oxygen. ",
		"A *continual flame* can be covered or hidden but not smothered or quenched.",
		"\n\n\n"
	].join('\n');
}