const _ = require('lodash');

const titles = [
	'The Burning Gallows',
	'The Ring of Nenlast',
	'Below the Blind Tavern',
	'Below the Hungering River',
	'Before Bahamut\'s Land',
	'The Cruel Grave from Within',
	'The Strength of Trade Road',
	'Through The Raven Queen\'s Worlds',
	'Within the Settlement',
	'The Crown from Within',
	'The Merchant Within the Battlefield',
	'Ioun\'s Fading Traveler',
	'The Legion Ingredient',
	'The Explorer Lure',
	'Before the Charming Badlands',
	'The Living Dead Above the Fearful Cage',
	'Vecna\'s Hidden Sage',
	'Bahamut\'s Demonspawn',
	'Across Gruumsh\'s Elemental Chaos',
	'The Blade of Orcus',
	'Beyond Revenge',
	'Brain of Insanity',
	'Breed Battle!, A New Beginning',
	'Evil Lake, A New Beginning',
	'Invasion of the Gigantic Cat, Part II',
	'Kraken War 2020',
	'The Body Whisperers',
	'The Diabolical Tales of the Ape-Women',
	'The Doctor Immortal',
	'The Doctor from Heaven',
	'The Graveyard',
	'Azure Core',
	'Core Battle',
	'Core of Heaven: The Guardian of Amazement',
	'Deadly Amazement III',
	'Dry Chaos IX',
	'Gate Thunder',
	'Guardian: Skies of the Dark Wizard',
	'Lute of Eternity',
	'Mercury\'s Planet: Brave Evolution',
	'Ruby of Atlantis: The Quake of Peace',
	'Sky of Zelda: The Thunder of Force',
	'Vyse\'s Skies',
	'White Greatness III',
	'Yellow Divinity',
	'Zidane\'s Ghost'
];

const subtitles = [
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
	'In an amazing kingdom, in an age of sorcery and lost souls, eight space pirates quest for freedom.',
	'In a cursed empire, five inventors oppose terrorism.',
	'On a crime-ridden planet of conspiracy, a watchman and an artificial intelligence try to find love and oppose lawlessness.',
	'In a forgotten land, a reporter and a spy try to stop the apocalypse.',
	'In a forbidden land of prophecy, a scientist and an archivist oppose a cabal of barbarians intent on stealing the souls of the innocent.',
	'On an infernal world of illusion, a grave robber and a watchman try to find revenge and combat a syndicate of mages intent on stealing the source of all magic.',
	'In a galaxy of dark magic, four fighters seek freedom.',
	'In an empire of deception, six tomb-robbers quest for the ultimate weapon and combat an army of raiders.',
	'In a kingdom of corruption and lost souls, in an age of panic, eight planetologists oppose evil.',
	'In a galaxy of misery and hopelessness, in a time of agony and pain, five planetologists search for vengance.',
	'In a universe of technology and insanity, in a time of sorcery, a computer techician quests for hope.',
	'On a planet of dark magic and barbarism, in an age of horror and blasphemy, seven librarians search for fame.',
	'In an empire of dark magic, in a time of blood and illusions, four monks try to find the ultimate weapon and combat terrorism.',
	'In a forgotten empire of dark magic, six kings try to prevent the destruction of mankind.',
	'In a galaxy of dark magic and horror, in an age of hopelessness, four marines and an outlaw combat evil.',
	'In a mysterious city of illusion, in an age of computerization, a witch-hunter tries to find the ultimate weapon and opposes an evil corporation.',
	'In a damned kingdom of technology, a virtual reality programmer and a fighter seek fame.',
	'In a hellish kingdom, in an age of blasphemy and blasphemy, an astrologer searches for fame.',
	'In a damned world of devils, an alien and a ranger quest for love and oppose a syndicate of demons.',
	'In a cursed galaxy, in a time of pain, seven librarians hope to avert the apocalypse.',
	'In a crime-infested galaxy, in an era of hopelessness and panic, three champions and a grave robber try to solve the ultimate crime.'
];


module.exports = ()=>{
	return `<style>
  .phb#p1{ text-align:center; }
  .phb#p1:after{ display:none; }
</style>

<div style='margin-top:450px;'></div>

# ${_.sample(titles)}

<div style='margin-top:25px'></div>
<div class='wide'>
##### ${_.sample(subtitles)}
</div>

\\page`;
};