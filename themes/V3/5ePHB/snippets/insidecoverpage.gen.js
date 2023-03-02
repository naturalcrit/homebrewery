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
	'Breed Battle!, A New Beginning',         'Evil Lake, A New Beginning',
	'Invasion of the Gigantic Cat, Part II',  'Kraken War 2020',
	'The Body Whisperers',                    'The Doctor from Heaven',
	'The Diabolical Tales of the Ape-Women',  'The Doctor Immortal',
	'Core of Heaven: Guardian of Amazement',  'The Graveyard',
	'Guardian: Skies of the Dark Wizard',     'Lute of Eternity',
	'Mercury\'s Planet: Brave Evolution',     'Azure Core',
	'Sky of Zelda: The Thunder of Force',     'Core Battle',
	'Ruby of Atlantis: The Quake of Peace',   'Deadly Amazement III',
	'Dry Chaos IX',                           'Gate Thunder',
	'Vyse\'s Skies',                          'White Greatness III',
	'Yellow Divinity',                        'Zidane\'s Ghost'
];

module.exports = ()=>{
return dedent`{{insideCover}}

# Player's Hand book
___
    
![image](https://i.imgur.com/dpg5qPT.png) {}

{{logo ![](/assets/naturalCritLogo.svg)}}
\page`;
};