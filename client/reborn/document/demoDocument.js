// Hand-authored AST that exercises every block type the Wave 2 renderer supports.
// Two pages: page one shows the canonical chapter-opener (h1 + drop-cap paragraph,
// continuing prose, a note callout, a sub-heading, a table, a bullet list).
// Page two shows a quote, a descriptive box, a horizontal rule, and a full
// 5e monster stat block.

import {
	t, strong, em, emStrong, link,
	paragraph, heading, hr,
	bulletList, table,
	note, descriptive, quote,
	statBlock,
} from './schema.js';

const page1 = {
	blocks : [
		heading(1, t('The Sunken Grove')),
		paragraph(
			t('Centuries before the Sword Coast was charted, an emerald spring fed a grove '),
			t('so vast that druids called it the world tree’s shadow. Today little remains '),
			t('above the silt, save for moss-blanketed standing stones and the brittle '),
			t('memory of a faith that once held the wilderness in trust. Adventurers who '),
			t('descend into the grove return changed, if they return at all, and the few '),
			t('who do speak of voices answering questions never asked aloud.'),
		),
		paragraph(
			t('The grove is a dungeon of damp tunnels carved by water and root. Its '),
			em('warden'),
			t(' is a corrupted druid known as '),
			strong('Vael of the Hollow'),
			t(', a former protector who broke under the strain of a forgotten oath. The '),
			t('party may meet her as foe, supplicant, or both, depending on what they '),
			t('have already done above ground.'),
		),
		note(
			[t('Running the Grove')],
			[
				[
					t('Encounters in the Sunken Grove should feel like riddles whose answers are '),
					t('half-remembered. When in doubt, let the wilderness reply with another '),
					t('question — a deer that lifts its head at exactly the wrong moment, '),
					t('or a wind that carries one player’s name and no one else’s.'),
				],
			],
		),
		heading(2, t('Approaches to the Grove')),
		paragraph(
			t('Three trails converge at the grove’s mouth. Each speaks to a different '),
			t('temperament, and each is liable to turn back any traveler who is not '),
			t('willing to be honest about why they came.'),
		),
		table(
			[[t('d6')], [t('Approach')], [t('Hazard')]],
			[
				[[t('1–2')], [t('The Stag Path')], [t('Brambles, then a doe that watches.')]],
				[[t('3')],   [t('The Pilgrim Steps')], [t('Stones that resent the unworthy.')]],
				[[t('4')],   [t('The Old Channel')], [t('Knee-deep cold; a memory of drowning.')]],
				[[t('5')],   [t('The Crow Road')], [t('A ledger no one signed.')]],
				[[t('6')],   [t('Through the Mist')], [t('Roll on the Mist Encounters table.')]],
			],
		),
		heading(3, t('Reading the Stones')),
		paragraph(
			t('A character who succeeds on a DC 14 Wisdom (Insight) check can tell that '),
			t('the standing stones are arranged around something the grove is trying to '),
			t('protect, not display. They mark the following truths:'),
		),
		bulletList(
			[t('The grove was not abandoned; it was '), em('left'), t('.')],
			[t('A name has been struck from each stone, but only one was carved deeply enough that the wound still shows.')],
			[t('A druid still tends the place, in the way a wound is tended.')],
		),
	],
};

const page2 = {
	blocks : [
		heading(2, t('The Warden Speaks')),
		quote(
			[[
				t('I planted these saplings the year your great-grandmother first '),
				t('took the staff. They were promised the river. The river broke '),
				t('its promise, and so did I, and so will you.'),
			]],
			[t('Vael of the Hollow')],
		),
		paragraph(
			t('Vael is not, strictly speaking, an enemy. She is a wound that has '),
			t('learned to walk and to speak in complete sentences. Players who '),
			t('attack her without hearing her out will fight a much harder fight '),
			t('than players who let her finish her grief.'),
		),
		descriptive(
			[t('What She Wants')],
			[
				[
					t('Vael wants the grove’s '),
					strong('true name'),
					t(' returned to the deepest stone. She does not know that this is what she wants — only that something is missing.'),
				],
			],
		),
		{
			type        : 'spell',
			name        : 'Wreath of Brambles',
			level       : 3,
			school      : 'transmutation',
			castingTime : '1 action',
			range       : 'Self (15-foot radius)',
			components  : 'V, S, M (a thorn from the grove)',
			duration    : 'Concentration, up to 1 minute',
			classes     : 'Druid, Ranger',
			description : [
				t('Brambles erupt from the soil within 15 feet of you. The area becomes difficult terrain and any creature that ends its turn there takes 2d8 piercing damage.'),
			],
			atHigherLevels : [
				t('When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d8 for each slot level above 3rd.'),
			],
		},
		statBlock({
			name              : 'Vael, Corrupted Druid',
			size              : 'Medium',
			creatureType      : 'humanoid (human, druid)',
			alignment         : 'neutral evil',
			armorClass        : 15,
			armorClassNote    : 'natural armor',
			hitPoints         : 112,
			hitDice           : '15d8 + 45',
			speed             : '30 ft.',
			abilities         : { str: 12, dex: 14, con: 16, int: 13, wis: 18, cha: 15 },
			saves             : 'Wis +7, Con +6',
			skills            : 'Nature +4, Perception +7',
			damageResistances : 'necrotic, poison',
			senses            : 'passive Perception 17',
			languages         : 'Common, Druidic, Sylvan',
			challenge         : '7 (2,900 XP)',
			traits            : [
				{
					name : 'Blighted Shape',
					text : [
						t('Vael can use her action to transform into the shape of a wolf '),
						t('twisted with bramble and rot. While transformed her speed becomes '),
						t('40 ft. and her bite deals an additional 1d6 necrotic damage.'),
					],
				},
				{
					name : 'Spellcasting',
					text : [
						t('Vael is a 10th-level spellcaster. Her spellcasting ability is '),
						t('Wisdom (spell save DC 15, +7 to hit with spell attacks). She has '),
						t('the following druid spells prepared:'),
					],
				},
			],
			actions : [
				{
					name : 'Multiattack',
					text : [t('Vael makes two thorn-lash attacks.')],
				},
				{
					name : 'Thorn Lash',
					text : [
						t('Melee Spell Attack: '),
						t('+7 to hit, reach 15 ft., one target. '),
						em('Hit: '),
						t('14 (3d6 + 4) piercing damage, and the target is grappled (escape DC 14) by reaching brambles.'),
					],
				},
			],
			legendaryActions : [
				{
					name : 'Root Snare',
					text : [
						t('Vael causes one creature she can see within 30 feet of her to make '),
						t('a DC 15 Strength saving throw. On a failure, the target is restrained '),
						t('until the end of its next turn.'),
					],
				},
			],
		}),
	],
};

const demoDocument = {
	metadata : {
		title    : 'The Sunken Grove',
		author   : 'Homebrewery Reborn — Wave 2 Demo',
		theme    : '5ePHB',
		pageSize : 'Letter',
	},
	pages : [page1, page2],
};

export default demoDocument;
