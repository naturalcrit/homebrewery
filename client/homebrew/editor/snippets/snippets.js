var SpellGen = require('./spell.gen.js');
var ClassTableGen = require('./classtable.gen.js');
var MonsterBlockGen = require('./monsterblock.gen.js');
var ClassFeatureGen = require('./classfeature.gen.js');
var FullClassGen = require('./fullclass.gen.js');

module.exports = [
	/*
	{
		tooltip : 'Full Class',
		icon : 'fa-user',
		snippet : FullClassGen,
	},
	*/
	{
		tooltip : 'Spell',
		icon : 'fa-magic',
		snippet : SpellGen,
	},
	{
		tooltip : 'Class Feature',
		icon : 'fa-trophy',
		snippet : ClassFeatureGen,
	},
	{
		tooltip : 'Note',
		icon : 'fa-sticky-note',
		snippet : function(){
			return ""
		},
	},
	{
		tooltip : 'Table',
		icon : 'fa-list',
		snippet : function(){
			return [
				"##### Cookie Tastiness",
				"| Tasty Level | Cookie Type |",
				"|:----:|:-------------|",
				"| -5  | Raisin |",
				"| 8th  | 1 or lower |",
				"| 11th | 2 or lower |",
				"| 14th | 3 or lower |",
				"| 17th | 4 or lower |\n\n",
			].join('\n');
		},
	},
	{
		tooltip : 'Monster Stat Block',
		icon : 'fa-bug',
		snippet : MonsterBlockGen,
	},
	{
		tooltip : "Class Table",
		icon : 'fa-table',
		snippet : ClassTableGen,
	},
	{
		tooltip : "Column Break",
		icon : 'fa-columns',
		snippet : function(){
			return "```\n```\n\n";
		}
	},
	{
		tooltip : "New Page",
		icon : 'fa-file-text',
		snippet : function(){
			return "\\page\n\n";
		}
	},
	{
		tooltip : "Vertical Spacing",
		icon : 'fa-arrows-v',
		snippet : function(){
			return "<div style='margin-top:140px'></div>\n\n";
		}
	},
	{
		tooltip : "Insert Image",
		icon : 'fa-image',
		snippet : function(){
			return "<img />";
		}
	}

]




































var temp = {

	intro : [
		'# Welcome to HomeBrew',
		'This tool you to effortless make and edit in real time D&D style ideas',
		'\nIt uses **markdown-syntax** anda well-designed style sheet to create stuff.',
		'As you edit text on the left it will live update on the right.',
		"Any changes you make will auto-saved to your browser as well.",
		"",
		"There's a few premade templates for common things in the PHB.",
		"Just hit the icons to inject the template wherever your cursor was in the text box. \n***Have fun.***"

	].join('\n'),


	spell : [
		"#### Continual Flame",
		"*2nd-level evocation*",
		"___",
		"- **Casting Time:** 1 action",
		"- **Range:** Touch",
		"- **Components:** V, S, M (ruby dust worth 50gp, which the spell consumes)",
		"- **Duration:** Until dispelled",
		"",
		"A flame, equivalent in brightness to a torch, springs from from an object that you touch. ",
		"The effect look like a regular flame, but it creates no heat and doesn't use oxygen. ",
		"A *continual flame* can be covered or hidden but not smothered or quenched."
	].join('\n'),

	destroyUndead : [
		"### Destroy Undead",
		"Starting at 5th level, when an undead fails its saving throw against your Turn Undead feature,",
		"the creature is instantly destroyed if its challange rating is at or below a certain threshold,",
		"as shown in the Destroy Undead table.",
		"",
		"##### Destroy Undead",
		"| Cleric Level | Destroys Undead of CR... |",
		"|:----:|:-------------|",
		"| 5th  | 1/2 or lower |",
		"| 8th  | 1 or lower |",
		"| 11th | 2 or lower |",
		"| 14th | 3 or lower |",
		"| 17th | 4 or lower |\n\n",
	].join('\n'),

	note : [
		"> ##### Variant: Playing on a Grid",
		"> If you play out a combat using a square grid and miniatures or other tokens, follow these rules",
		">",
		"> ***Squares.*** Each square on the grid represents 5 feet.",
		">",
		"> ***Speed.*** Rather than moving foot by foot, move square by square on the grid. This means you use your speed in 5-foot segments.",
	].join('\n'),

	statBlock :[
		"___",
		"> ## Warhorse",
		">*Large beast, unaligned*",
		"> ___",
		"> - **Armor Class** 18 (natural armor)",
		"> - **Hit Points** 33 (6d8 + 6)",
		"> - **Speed** 25ft",
		">___",
		">|STR|DEX|CON|INT|WIS|CHA|",
		">|:---:|:---:|:---:|:---:|:---:|:---:|:---:|",
		">|18 (+4)|18 (+4)|18 (+4)|18 (+4)|18 (+4)|18 (+4)|",
		">___",
		"> - **Damage Immunities** poison, psychic",
		"> - **Condition Immunities** blinded, charmed, deafened, exhaustion, frightened, paralyzed, petrified, poisoned",
		"> - **Languages** None",
		"> - **Challenge** 1 (200 XP)",
		"> ___",
		"> ***Pack Tactics.*** These guys work together. Like super well, you don't even know.",
		">",
		"> ***False Appearance. *** While the armor reamin motionless, it is indistinguishable from a normal suit of armor.",
		"> ### Actions",
		"> ***Multiattack.*** The armor makes two two melee attacks.",
		">",
		"> ***Slam.*** *Melee Weapon Attack:* +4 to hit, reach 5ft., one target. *Hit* 5 (1d6 + 2) ",
	].join('\n'),

	classTable : [

	].join('\n'),


}