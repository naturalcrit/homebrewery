const _ = require('lodash');
const dedent = require('dedent-tabs').default;

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
	return `|${_.times(6, function(){
		const num = _.random(1, 20);
		const mod = Math.ceil(num/2 - 5);
		return `${num} (${mod >= 0 ? `+${mod}` : mod})`;
	}).join('|')}|`;
};

const genAbilities = function(){
	return _.sample([
		'***Pack Tactics.*** These guys work together like peanut butter and jelly.',
		'***Fowl Appearance.*** While the creature remains motionless, it is indistinguishable from a normal chicken.',
		'***Onion Stench.*** Any creatures within 5 feet of this thing develops an irrational craving for onion rings.',
		'***Enormous Nose.*** This creature gains advantage on any check involving putting things in its nose.',
		'***Sassiness.*** When questioned, this creature will talk back instead of answering.',
		'***Big Jerk.*** Whenever this creature makes an attack, it starts telling you how much cooler it is than you.',
	]);
};

const genLongAbilities = function(){
	return _.sample([
		dedent`***Pack Tactics.*** These guys work together like peanut butter and jelly. Jelly and peanut butter.

		When one of these guys attacks, the target is covered with, well, peanut butter and jelly.`,
		dedent`***Hangriness.*** This creature is angry, and hungry. It will refuse to do anything with you until its hunger is satisfied.

		When in visual contact with this creature, you must purchase an extra order of fries, even if they say they aren't hungry.`,
		dedent`***Full of Detergent.*** This creature has swallowed an entire bottle of dish detergent and is actually having a pretty good time.

		While walking near this creature, you must make a dexterity check or become "a soapy mess" for three hours, after which your skin will get all dry and itchy.`
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

	return `***${name}.*** *Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) `;
};


module.exports = {

	monster : function(classes, genLines){
		return dedent`
			{{${classes}
			## ${getMonsterName()}
			*${getType()}, ${getAlignment()}*
			___
			**Armor Class** :: ${_.random(10, 20)} (chain mail, shield)
			**Hit Points**  :: ${_.random(1, 150)} (1d4 + 5)
			**Speed**       :: ${_.random(0, 50)} ft.
			___
			|  STR  |  DEX  |  CON  |  INT  |  WIS  |  CHA  |
			|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
			${getStats()}
			___
			**Condition Immunities** :: ${genList(['groggy', 'swagged', 'weak-kneed', 'buzzed', 'groovy', 'melancholy', 'drunk'], 3)}
			**Senses**               :: darkvision 60 ft., passive Perception ${_.random(3, 20)}
			**Languages**            :: ${genList(['Common', 'Pottymouth', 'Gibberish', 'Latin', 'Jive'], 2)}
			**Challenge**            :: ${_.random(0, 15)} (${_.random(10, 10000)} XP) {{bonus **Proficiency Bonus** +${_.random(2, 6)}}}
			___
			${_.times(_.random(genLines, genLines + 2), function(){return genAbilities();}).join('\n:\n')}
			:
			${genLongAbilities()}
			### Actions
			${_.times(_.random(genLines, genLines + 2), function(){return genAction();}).join('\n:\n')}
			}}
			\n`;
	}
};
