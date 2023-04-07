const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const titles = [
	'The Burning Gallows',                    'The Ring of Nenlast',
	'Below the Blind Tavern',                 'Below the Hungering River',
	'Before Bahamut\'s Land',                 'The Cruel Grave from Within',
	'The Strength of Trade Road',             'Through The Raven Queen\'s Worlds',
	'Within the Settlement',                  'The Crown from Within',
	'The Merchant Within the Battlefield',    'Ioun\'s Fading Traveler',
	'The Legion Ingredient',                  'The Explorer Lure',
	'Before the Charming Badlands',           'Vecna\'s Hidden Sage',
	'The Living Dead Above the Fearful Cage', 'Bahamut\'s Demonspawn',
	'Across Gruumsh\'s Elemental Chaos',      'The Blade of Orcus',
	'Beyond Revenge',                         'Brain of Insanity',
	'A New Beginning',                        'Evil Lake of the Merfolk',
	'Invasion of the Gigantic Cat, Part II',  'Kraken War 2020',
	'The Body Whisperers',                    'The Doctor from Heaven',
	'The Diabolical Tales of the Ape-Women',  'The Doctor Immortal',
	'Core of Heaven: Guardian of Amazement',  'The Graveyard',
	'Guardian: Skies of the Dark Wizard',     'Lute of Eternity',
	'Mercury\'s Planet: Brave Evolution',     'Azure Core',
	'Sky of Zelda: The Thunder of Force',     'Core Battle',
	'Ruby of Atlantis: The Quake of Peace',   'Deadly Amazement III',
	'Dry Chaos IX',                           'Gate Thunder',
	'Vyse\'s Skies',                          'Blue Greatness III',
	'Yellow Divinity',                        'Zidane\'s Ghost'
];

const subtitles = [
	'Tomb of Shadows',                        'Dragon\'s Lair',
	'Lost Caverns',                           'The Necromancer',
	'Mystic Forest',                          'Cursed Ruins',
	'The Dark Abyss',                         'Enchanted Maze',
	'Haunted Castle',                         'Sands of Fate',
	'Dragon\'s Hoard',                        'Undead Menace',
	'Lost City Ruins',                        'Goblin Ambush',
	'Enchanted Forest',                       'Darkness Rising',
	'Quest for Glory',                        'Ancient Prophecy',
	'Shadowy Depths',                         'Mystic Isles'
];

const footnote = [
	'In an ominous universe, a botanist opposes terrorism.',
	'In a demon-haunted city, in an age of lies and hate, a physicist tries to find an ancient treasure and battles a mob of aliens.',
	'In a land of corruption, two cyberneticists and a dungeon delver search for freedom.',
	'In an evil empire of horror, two rangers battle the forces of hell.',
	'In a lost city, in an age of sorcery, a librarian quests for revenge.',
	'In a universe of illusions and danger, three time travellers and an adventurer search for justice.',
	'In a forgotten universe of barbarism, in an era of terror and mysticism, a virtual reality programmer and a spy try to find vengance and battle crime.',
	'In a universe of demons, in an era of insanity and ghosts, three bodyguards and a bodyguard try to find vengance.',
	'In a kingdom of corruption and battle, seven artificial intelligences try to save the last living fertile woman.',
	'In a universe of virutal reality and agony, in an age of ghosts and ghosts, a fortune-teller and a wanderer try to avert the apocalypse.',
	'In a crime-infested kingdom, three martial artists quest for the truth and oppose evil.',
	'In a terrifying universe of lost souls, in an era of lost souls, eight dancers fight evil.',
	'In a galaxy of confusion and insanity, three martial artists and a duke battle a mob of psychics.',
	'In an amazing kingdom, a wizard and a secretary hope to prevent the destruction of mankind.',
	'In a kingdom of deception, a reporter searches for fame.',
	'In a hellish empire, a swordswoman and a duke try to find the ultimate weapon and battle a conspiracy.',
	'In an evil galaxy of illusion, in a time of technology and misery, seven psychiatrists battle crime.',
	'In a dark city of confusion, three swordswomen and a singer battle lawlessness.',
	'In an ominous empire, in an age of hate, two philosophers and a student try to find justice and battle a mob of mages intent on stealing the souls of the innocent.',
	'In a kingdom of panic, six adventurers oppose lawlessness.',
	'In a land of dreams and hopelessness, three hackers and a cyborg search for justice.',
	'On a planet of mysticism, three travelers and a fire fighter quest for the ultimate weapon and oppose evil.',
	'In a wicked universe, five seers fight lawlessness.',
	'In a kingdom of death, in an era of illusion and blood, four colonists search for fame.',
	'In an amazing kingdom, in an age of sorcery and lost souls, eight space pirates quest for freedom.'
];

module.exports = {

	front : function() {
		return dedent`
		  {{frontCover}}

		  {{logo ![](/assets/naturalCritLogo.svg)}}

		  # ${_.sample(titles)}
		  ## ${_.sample(subtitles)}
		  ___

		  {{banner HOMEBREW}}

		  {{footnote
		    ${_.sample(footnote)}
		  }}

		  ![background image](https://i.imgur.com/IwHRrbF.jpg){position:absolute,bottom:0,left:0,height:100%}

		  \page`;
	},

	inside : function() {
		return dedent`
			{{insideCover}}

			# ${_.sample(titles)}
			## ${_.sample(subtitles)}
			___

			{{imageMaskCenter${_.random(1, 16)},--offsetX:0%,--offsetY:0%,--rotation:0
			  ![](https://i.imgur.com/IsfUnFR.jpg){height:100%}
			}}

			{{logo ![](/assets/naturalCritLogo.svg)}}

			\page`;
	}
};
