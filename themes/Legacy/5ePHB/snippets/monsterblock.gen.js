const _ = require('lodash');

const genList = function(list, max){
	return _.sampleSize(list, _.random(0, max)).join(', ') || 'None';
};

const getMonsterName = function(){
	return _.sample([
		'All-devouring Baseball Imp',
		'All-devouring Gumdrop Wraith',
		'Chocolate Hydra',
		'Devouring Peacock',
		'Economy-sized Colossus of the Lemonade Stand',
		'Ghost Pigeon',
		'Gibbering Duck',
		'Sparklemuffin Peacock Spider',
		'Gum Elemental',
		'Illiterate Construct of the Candy Store',
		'Ineffable Chihuahua',
		'Irritating Death Hamster',
		'Irritating Gold Mouse',
		'Juggernaut Snail',
		'Juggernaut of the Sock Drawer',
		'Koala of the Cosmos',
		'Mad Koala of the West',
		'Milk Djinni of the Lemonade Stand',
		'Mind Ferret',
		'Mystic Salt Spider',
		'Necrotic Halitosis Angel',
		'Pinstriped Famine Sheep',
		'Ritalin Leech',
		'Shocker Kangaroo',
		'Stellar Tennis Juggernaut',
		'Wailing Quail of the Sun',
		'Angel Pigeon',
		'Anime Sphinx',
		'Bored Avalanche Sheep of the Wasteland',
		'Devouring Nougat Sphinx of the Sock Drawer',
		'Djinni of the Footlocker',
		'Ectoplasmic Jazz Devil',
		'Flatuent Angel',
		'Gelatinous Duck of the Dream-Lands',
		'Gelatinous Mouse',
		'Golem of the Footlocker',
		'Lich Wombat',
		'Mechanical Sloth of the Past',
		'Milkshake Succubus',
		'Puffy Bone Peacock of the East',
		'Rainbow Manatee',
		'Rune Parrot',
		'Sand Cow',
		'Sinister Vanilla Dragon',
		'Snail of the North',
		'Spider of the Sewer',
		'Stellar Sawdust Leech',
		'Storm Anteater of Hell',
		'Stupid Spirit of the Brewery',
		'Time Kangaroo',
		'Tomb Poodle',
	]);
};

const getType = function(){
	return `${_.sample(['Tiny', 'Small', 'Medium', 'Large', 'Gargantuan', 'Stupidly vast'])} ${_.sample(['beast', 'fiend', 'annoyance', 'guy', 'cutie'])}`;
};

const getAlignment = function(){
	return _.sample([
		'annoying evil',
		'chaotic gossipy',
		'chaotic sloppy',
		'depressed neutral',
		'lawful bogus',
		'lawful coy',
		'manic-depressive evil',
		'narrow-minded neutral',
		'neutral annoying',
		'neutral ignorant',
		'oedpipal neutral',
		'silly neutral',
		'unoriginal neutral',
		'weird neutral',
		'wordy evil',
		'unaligned'
	]);
};

const getStats = function(){
	return `>|${_.times(6, function(){
		const num = _.random(1, 20);
		const mod = Math.ceil(num/2 - 5);
		return `${num} (${mod >= 0 ? `+${mod}` : mod})`;
	}).join('|')}|`;
};

const genAbilities = function(){
	return _.sample([
		'> ***Pack Tactics.*** These guys work together. Like super well, you don\'t even know.',
		'> ***Fowl Appearance.*** While the creature remains motionless, it is indistinguishable from a normal chicken.',
		'> ***Onion Stench.*** Any creatures within 5 feet of this thing develops an irrational craving for onion rings.',
		'> ***Enormous Nose.*** This creature gains advantage on any check involving putting things in its nose.',
		'> ***Sassiness.*** When questioned, this creature will talk back instead of answering.',
		'> ***Big Jerk.*** Thinks he is just *waaaay* better than you.',
	]);
};

const genAction = function(){
	const name = _.sample([
		'Abdominal Drop',
		'Airplane Hammer',
		'Atomic Death Throw',
		'Bulldog Rake',
		'Corkscrew Strike',
		'Crossed Splash',
		'Crossface Suplex',
		'DDT Powerbomb',
		'Dual Cobra Wristlock',
		'Dual Throw',
		'Elbow Hold',
		'Gory Body Sweep',
		'Heel Jawbreaker',
		'Jumping Driver',
		'Open Chin Choke',
		'Scorpion Flurry',
		'Somersault Stump Fists',
		'Suffering Wringer',
		'Super Hip Submission',
		'Super Spin',
		'Team Elbow',
		'Team Foot',
		'Tilt-a-whirl Chin Sleeper',
		'Tilt-a-whirl Eye Takedown',
		'Turnbuckle Roll'
	]);

	return `> ***${name}.*** *Melee Weapon Attack:* +4 to hit, reach 5ft., one target. *Hit* 5 (1d6 + 2) `;
};


module.exports = {

	full : function(){
		return `${[
			'___',
			'___',
			`> ## ${getMonsterName()}`,
			`>*${getType()}, ${getAlignment()}*`,
			'> ___',
			`> - **Armor Class** ${_.random(10, 20)}`,
			`> - **Hit Points** ${_.random(1, 150)}(1d4 + 5)`,
			`> - **Speed** ${_.random(0, 50)}ft.`,
			'>___',
			'>|STR|DEX|CON|INT|WIS|CHA|',
			'>|:---:|:---:|:---:|:---:|:---:|:---:|',
			getStats(),
			'>___',
			`> - **Condition Immunities** ${genList(['groggy', 'swagged', 'weak-kneed', 'buzzed', 'groovy', 'melancholy', 'drunk'], 3)}`,
			`> - **Senses** passive Perception ${_.random(3, 20)}`,
			`> - **Languages** ${genList(['Common', 'Pottymouth', 'Gibberish', 'Latin', 'Jive'], 2)}`,
			`> - **Challenge** ${_.random(0, 15)} (${_.random(10, 10000)} XP)`,
			'> ___',
			_.times(_.random(3, 6), function(){
				return genAbilities();
			}).join('\n>\n'),
			'> ### Actions',
			_.times(_.random(4, 6), function(){
				return genAction();
			}).join('\n>\n'),
		].join('\n')}\n\n\n`;
	},

	half : function(){
		return `${[
			'___',
			`> ## ${getMonsterName()}`,
			`>*${getType()}, ${getAlignment()}*`,
			'> ___',
			`> - **Armor Class** ${_.random(10, 20)}`,
			`> - **Hit Points** ${_.random(1, 150)}(1d4 + 5)`,
			`> - **Speed** ${_.random(0, 50)}ft.`,
			'>___',
			'>|STR|DEX|CON|INT|WIS|CHA|',
			'>|:---:|:---:|:---:|:---:|:---:|:---:|',
			getStats(),
			'>___',
			`> - **Condition Immunities** ${genList(['groggy', 'swagged', 'weak-kneed', 'buzzed', 'groovy', 'melancholy', 'drunk'], 3)}`,
			`> - **Senses** passive Perception ${_.random(3, 20)}`,
			`> - **Languages** ${genList(['Common', 'Pottymouth', 'Gibberish', 'Latin', 'Jive'], 2)}`,
			`> - **Challenge** ${_.random(0, 15)} (${_.random(10, 10000)} XP)`,
			'> ___',
			_.times(_.random(2, 3), function(){
				return genAbilities();
			}).join('\n>\n'),
			'> ### Actions',
			_.times(_.random(1, 2), function(){
				return genAction();
			}).join('\n>\n'),
		].join('\n')}\n\n\n`;
	}
};
