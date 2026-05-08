// Long-form stress demo for the Wave 5 paginator.
//
// 5–10 pages of mixed content (paragraphs, headings, lists, tables, multiple
// stat blocks, callouts, descriptive boxes, quotes, a spell). Authored as a
// flat block stream so the paginator is responsible for every page break;
// the AST exposes a single page so legacy "pages-in-AST" code paths see
// only the un-paginated flow.

import {
	t, em, strong, link,
	paragraph, heading, hr,
	bulletList, table,
	note, descriptive, quote,
	statBlock,
} from './schema.js';

const lorem = (n)=>{
	// Deterministic flavor text: a small bag of D&D-flavoured sentences,
	// rotated by index so two paragraphs in a row don't read identically.
	const bag = [
		'The wind through the standing stones carries a tone older than the language used to describe it.',
		'Travelers who pause too long at the crossroads find that the moss has spoken their names back to them.',
		'A scholar of the College of Whispers once cataloged seventeen distinct kinds of silence in this region; only twelve are still extant.',
		'The river forgets what it was named, but it remembers every promise broken on its banks.',
		'Roots from the older grove still reach beneath the ruined manor, and they are not satisfied with the soil they have been given.',
		'Most of what is written about the keep is wrong, but the wrongness is the point: the keep prefers it that way.',
		'Three sisters were said to walk this hill, and only two of them ever returned to the same century twice.',
		'A merchant who tried to map the briar paths has since become a feature of them.',
		'No matter how the fog shifts, the cairn always sits exactly fifty paces uphill of wherever the traveler thinks the cairn is.',
	];
	const out = [];
	for (let i = 0; i < n; i++){
		out.push(bag[i % bag.length]);
		out.push(' ');
	}
	return [t(out.join(''))];
};

const para = (...content)=>paragraph(...content);

const monsterA = statBlock({
	name              : 'Bramble-Knight',
	size              : 'Medium',
	creatureType      : 'plant (formerly humanoid)',
	alignment         : 'lawful neutral',
	armorClass        : 17,
	armorClassNote    : 'thorny mail',
	hitPoints         : 92,
	hitDice           : '14d8 + 28',
	speed             : '30 ft.',
	abilities         : { str: 17, dex: 12, con: 14, int: 9, wis: 13, cha: 8 },
	saves             : 'Str +6, Con +5',
	skills            : 'Athletics +6, Perception +4',
	damageResistances : 'piercing, slashing',
	senses            : 'passive Perception 14',
	languages         : 'Common, Sylvan',
	challenge         : '5 (1,800 XP)',
	traits            : [
		{ name: 'Thornbound', text: [t('A creature that hits the bramble-knight with a melee attack takes 1d6 piercing damage.')] },
		{ name: 'Verdant Stride', text: [t('Difficult terrain composed of plants does not cost the bramble-knight extra movement.')] },
	],
	actions : [
		{ name: 'Multiattack', text: [t('The bramble-knight makes two longsword attacks.')] },
		{ name: 'Longsword', text: [t('Melee Weapon Attack: '), t('+6 to hit, reach 5 ft., one target. '), em('Hit: '), t('8 (1d8 + 4) slashing damage.')] },
	],
});

const monsterB = statBlock({
	name              : 'Hollow Stag',
	size              : 'Large',
	creatureType      : 'fey beast',
	alignment         : 'chaotic neutral',
	armorClass        : 14,
	hitPoints         : 76,
	hitDice           : '9d10 + 27',
	speed             : '50 ft.',
	abilities         : { str: 18, dex: 16, con: 16, int: 6, wis: 14, cha: 11 },
	skills            : 'Perception +4, Stealth +5',
	damageImmunities  : 'poison',
	conditionImmunities : 'charmed, frightened',
	senses            : 'darkvision 60 ft., passive Perception 14',
	languages         : 'understands Sylvan but cannot speak',
	challenge         : '4 (1,100 XP)',
	traits            : [
		{ name: 'Fey Step', text: [t('Once per short rest, the hollow stag teleports up to 30 feet to an unoccupied space it can see.')] },
	],
	actions : [
		{ name: 'Antlers', text: [t('Melee Weapon Attack: '), t('+7 to hit, reach 5 ft., one target. '), em('Hit: '), t('13 (2d8 + 4) piercing damage. If the target is a Medium or smaller creature, it must succeed on a DC 14 Strength saving throw or be knocked prone.')] },
	],
});

const monsterC = statBlock({
	name              : 'Wretchroot Druid',
	size              : 'Medium',
	creatureType      : 'humanoid (human, druid)',
	alignment         : 'neutral evil',
	armorClass        : 16,
	armorClassNote    : 'hide armor + shield',
	hitPoints         : 132,
	hitDice           : '17d8 + 51',
	speed             : '30 ft.',
	abilities         : { str: 11, dex: 14, con: 16, int: 12, wis: 19, cha: 13 },
	saves             : 'Wis +8, Int +5',
	skills            : 'Nature +5, Perception +8',
	damageResistances : 'necrotic, poison',
	senses            : 'darkvision 60 ft., passive Perception 18',
	languages         : 'Common, Druidic, Sylvan, Undercommon',
	challenge         : '9 (5,000 XP)',
	traits : [
		{ name: 'Innate Spellcasting', text: [t('The druid\'s spellcasting ability is Wisdom (spell save DC 16). She can cast each of the following at will: druidcraft, poison spray, thorn whip.')] },
		{ name: 'Blighted Wild Shape', text: [t('As an action, the druid magically polymorphs into a corrupted beast form (CR 2 or less). Her statistics other than size are replaced; she retains her hit points and Wisdom score.')] },
	],
	actions : [
		{ name: 'Multiattack', text: [t('The druid makes two staff attacks.')] },
		{ name: 'Quarterstaff', text: [t('Melee Weapon Attack: '), t('+5 to hit, reach 5 ft., one target. '), em('Hit: '), t('5 (1d8 + 1) bludgeoning damage, or 6 (1d10 + 1) bludgeoning damage if used with two hands, plus 9 (2d8) necrotic damage.')] },
		{ name: 'Bramble Snare (Recharge 5–6)', text: [t('Each creature within 15 feet of the druid must make a DC 15 Strength saving throw or be restrained by reaching brambles until the end of the druid\'s next turn.')] },
	],
	legendaryActions : [
		{ name: 'Step of the Grove', text: [t('The druid moves up to her speed without provoking opportunity attacks.')] },
		{ name: 'Cantrip', text: [t('The druid casts one cantrip.')] },
		{ name: 'Withering Touch (Costs 2 Actions)', text: [t('One creature within 30 feet must succeed on a DC 16 Constitution saving throw or take 14 (4d6) necrotic damage and have its hit point maximum reduced by the same amount.')] },
	],
});

const blocks = [
	heading(1, t('The Long Road to Hollow Reach')),
	paragraph(
		t('Centuries before any caravan willingly took the eastern fork, '),
		em('the Long Road'),
		t(' was a pilgrim track maintained by the Order of the Verdant Hand. The road outlived the order; the pilgrims outlived neither, though the track still expects them. '),
		...lorem(2),
	),
	paragraph(...lorem(4)),
	heading(2, t('The Three Approaches')),
	paragraph(...lorem(2)),
	bulletList(
		[t('The '), strong('Stag Path'), t(' winds through bracken and antler-ledge.')],
		[t('The '), strong('Pilgrim Steps'), t(' rise switchbacked along the gorge.')],
		[t('The '), strong('Crow Road'), t(' is what is left of an old toll-line.')],
	),
	paragraph(...lorem(3)),

	heading(2, t('A Random Encounter Table')),
	table(
		[[t('d8')], [t('Encounter')], [t('Notes')]],
		[
			[[t('1')], [t('Wandering minstrel')], [t('Refuses payment, demands a story instead.')]],
			[[t('2')], [t('Boar in a snare')], [t('Setting it free triggers a forest spirit favour.')]],
			[[t('3')], [t('Bramble-knight patrol')], [t('Two of these, see stat block.')]],
			[[t('4')], [t('Lost child')], [t('Not a child. Not lost.')]],
			[[t('5')], [t('Hollow stag')], [t('Will trade an antler for a song.')]],
			[[t('6')], [t('Wretchroot druid')], [t('Run.')]],
			[[t('7')], [t('Cairn that follows')], [t('Each rest, it is closer.')]],
			[[t('8')], [t('Old toll-stone')], [t('Demands a name in payment.')]],
		],
	),
	paragraph(...lorem(3)),

	note(
		[t('Running The Long Road')],
		[
			[
				t('The road is meant to feel like a held breath. Resist the urge to populate every clearing with combat. The land\'s '),
				em('memory'),
				t(' is the antagonist; encounters are punctuation.'),
			],
			[t('Players who skip the optional rests should pay an attrition tax — exhaustion, lost rations, or a dream they didn\'t consent to.')],
		],
	),

	heading(3, t('The First Encounter')),
	paragraph(...lorem(4)),
	monsterA,

	heading(2, t('The Hollow Reach Itself')),
	paragraph(...lorem(3)),
	descriptive(
		[t('The Reach at Dawn')],
		[
			[
				t('Mist hangs in slabs across the valley floor, slow-moving and faintly luminous. Sound carries oddly: a footstep ten feet away can sound nearer than the speaker\'s own breath. The brambles, dry and brown elsewhere, here are emerald and supple, as if drinking from something underneath the soil.'),
			],
		],
	),
	paragraph(...lorem(3)),

	quote(
		[[t('They left the road, my lord, and the road never forgave them. It still has not. It still has them.')]],
		[t('A surviving outrider, statement to the Knight-Marshal')],
	),
	paragraph(...lorem(2)),

	heading(3, t('The Hollow Stag')),
	paragraph(...lorem(2)),
	monsterB,

	heading(2, t('Beneath the Reach')),
	paragraph(...lorem(4)),
	bulletList(
		[t('A '), strong('moss-covered cairn'), t(' that hums when struck.')],
		[t('A '), strong('lichgate'), t(' overgrown with thorn-ivy.')],
		[t('A '), strong('spring-fed pool'), t(' whose surface returns the wrong reflection.')],
		[t('A '), strong('hollow tree'), t(' wide enough to walk inside.')],
	),
	paragraph(...lorem(3)),

	{
		type        : 'spell',
		name        : 'Pilgrim\'s Memory',
		level       : 2,
		school      : 'divination',
		castingTime : '1 action',
		range       : 'Self',
		components  : 'V, S, M (a coin from a road no longer travelled)',
		duration    : 'Concentration, up to 10 minutes',
		classes     : 'Bard, Cleric, Druid',
		description : [
			t('You recall the names of every traveler who has shared the same path with you in the past century. You can ask the spell one yes-or-no question per minute about events that took place along this road; the spell answers truthfully but obliquely.'),
		],
		atHigherLevels : [
			t('When you cast this spell using a spell slot of 4th level or higher, you may also recall '),
			em('why'),
			t(' each traveler took the road, though not what they sought.'),
		],
	},

	paragraph(...lorem(3)),

	heading(2, t('The Final Confrontation')),
	paragraph(...lorem(3)),
	note(
		[t('Vael\'s Successor')],
		[[
			t('If your campaign already used '),
			em('Vael of the Hollow'),
			t(' from '),
			link('The Sunken Grove', '#sunken-grove'),
			t(', the wretchroot druid below is her apprentice — and your party owes them both an answer.'),
		]],
	),
	paragraph(...lorem(2)),
	monsterC,

	heading(2, t('Aftermath')),
	paragraph(...lorem(3)),
	hr(),
	paragraph(...lorem(2)),
	heading(3, t('Treasures Recovered')),
	bulletList(
		[t('A '), em('staff of the verdant hand'), t(' (acts as a +1 quarterstaff and a druidic focus).')],
		[t('Three '), em('hollow-stag antlers'), t(' (each worth 250 gp; valued more by certain fey).')],
		[t('A ledger written in mirror script and signed only "V."')],
	),
	paragraph(...lorem(3)),
	heading(3, t('Hooks for Future Adventures')),
	paragraph(...lorem(3)),
];

const longDemo = {
	metadata : {
		title    : 'The Long Road to Hollow Reach',
		author   : 'Homebrewery Reborn — Wave 5 paginator stress demo',
		theme    : '5ePHB',
		pageSize : 'Letter',
	},
	pages : [{ blocks }],
};

export default longDemo;
