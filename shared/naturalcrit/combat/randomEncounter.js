var _ = require('lodash');



var getName = function(){
	return _.sample([
		"Assault of the Vampire",
		"Beyond Horror",
		"Bloodthirsty Odyssey to Saturn",
		"Claw of the Breed",
		"Curse of Samson",
		"Electrical Christmas",
		"Joseph Clark Loves",
		"Mind of the Finder",
		"Mudslide",
		"Nun of Insanity",
		"Odyssey to The Hollow Earth",
		"Reaper Battle",
		"The Bird-Man goes to The Hollow Earth",
		"The Bloodthirsty Kiss of The Decadent Bird",
		"The Diseased Assasin",
		"The Elephant-Person goes to Mars",
		"The Evil Saga of the Grizzly-Women",
		"The Octopus-Person",
		"The Whorehouse of Medusa",
		"Assignment: Sensuality, A New Beginning",
		"Avalanche 2010",
		"Body of Plague",
		"Bones of the Zombie",
		"Clone Snatchers",
		"Curse of Lizzie Borden",
		"Damnation Breakers",
		"Disease Pit",
		"Emperor Beauty",
		"Fate of The Abominable Indestructible Women",
		"Love Festival",
		"The Beta Person, Part 8",
		"The Horrible Undead Men",
		"The Inhuman People",
		"The Love of The Psychedelic Beast",
		"The Mutant Depraved",
		"The Policeman Corrupted, Part 5",
		"The Psychedelic Operation",
		"The Terrible Policewoman",
		"War Beyond El Dorado",
		"Battle of London",
		"Gold Love",
		"I Married Aladdin",
		"Johnny Walker Loves",
		"King Love",
		"Lancelot versus Dracula, The Next Generation",
		"Licentious Forest",
		"Passion Festival",
		"Passion Harvesters",
		"Sinbad meets Lizzie Borden",
		"Son of The Impossible Ant-People",
		"The Blood Ravagers",
		"The Body Fighter",
		"The Cat-Men Posessed, Chapter 2",
		"The Dog-Women from The Past",
		"The New York Sensation",
		"The Nurse Destroyed",
		"The Soulless Spy",
		"The Soulless Swindler",
		"The Terrifying Vampires",
		"Beyond Shangri-La",
		"Brood of Disease",
		"Claw of Courage",
		"Fate of The Gamma Boy, The Revenge",
		"Festival of the Controller",
		"Forest Fire",
		"Genocide!",
		"Heart of the Devil",
		"I was a Swindler for the SS",
		"I was an Executioner for the FBI",
		"Life Land",
		"She was a teenaged Annie Oakley",
		"The Blind Vigilante",
		"The Cybernetic Eternity",
		"The Diabolical Tiffany Parker",
		"The Diseased Alien",
		"The Legend of Lizzie Borden",
		"The Legless Hunter",
		"The Moscow Terror",
		"Wonder Festival"
	]);
};

var getPlot = function(){
	return _.sample([
		"In a cursed galaxy, in an age of illusions, four barbarians and a conjurer battle a horde of murderers.",
		"In a wicked kingdom, in a time of war, a philosopher tries to find the cure for a deadly disease.",
		"In a godless land of terror, in a time of war and blood, a swordsman and a chemist battle evil.",
		"In a terrifying land of ghosts, a robot and a sailor try to find revenge.",
		"In a kingdom of misery, in a time of danger, two ambassadors oppose a conspiracy intent on on taking over the world.",
		"In a demon-haunted land, in a time of lost souls and suffering, a xenobiologist and an engineer oppose lawlessness.",
		"In a dark kingdom, in a time of deception and deception, a secret agent seeks an ancient treasure.",
		"In a distant galaxy, two policemans and a scientist try to find love.",
		"In a universe of prophecy and lies, in a time of wonder and warfare, a virtual reality engineer tries to stop the destruction of mankind.",
		"In a land of confusion, five monks oppose evil.",
		"In a world of prophecy and panic, in an era of mysticism and doom, a hacker battles evil.",
		"In a city of fear, a cleric and a magician hope to save the last living fertile woman.",
		"On a crime-ridden world of illusion, a prostitute seeks justice and combats an army of assasins intent on on destroying humanity.",
		"In a kingdom of demons, three businesspersons and an ambassador quest for hope and battle evil.",
		"On a planet of magic and suffering, in an era of doom, eight aliens quest for fame and combat a cabal of fallen angels intent on stealing the souls of the innocent.",
		"In a terrifying universe of lost souls, a seer hopes to save a kidnapped princess.",
		"On an infernal planet of blood, four secret agents battle a syndicate of zombies intent on on summoning an evil god.",
		"In a dark kingdom, in an age of hate, a computer programmer fights evil.",
		"In an ominous land, in an age of panic, four wanderers and a linguist search for revenge and oppose terrorism.",
		"In a universe of madness and devils, in a time of lies and danger, a mutant seeks a mysterious artifact.",
		"On an infernal planet of terror, in a time of secrets and prophecy, five dutchesses try to save a kidnapped physicist.",
		"In a galaxy of devils, in an era of virutal reality, a necromancer attempts to avert the apocalypse.",
		"In a sinful universe, in an era of enchantment and devils, two champions seek revenge.",
		"In a land of murder, a farmer hopes to solve the ultimate crime.",
		"In a barbaric kingdom of hate, three theologians and a noble seek an ancient treasure and combat a horde of undead.",
		"On a planet of chaos, in an age of magic, a student and a spirit try to find freedom and fight crime.",
		"On a barbaric planet, in an era of prophecy and wonder, two bodyguards hope to find the cure for a deadly disease.",
		"In a crime-infested galaxy, a champion and a jailer try to find the ultimate weapon and fight a horde of mages intent on on destroying humanity.",
		"In a land of prophecy and mysteries, a clone seeks hope and combats crime.",
		"In a galaxy of mysticism and pain, four secretaries and a gambler hope to stop the apocalypse.",
		"On a planet of illusion and horror, three novelists and a professor try to find vengance.",
		"In a galaxy of enchantment and hate, in a time of barbarism and danger, four tomb-robbers combat the forces of hell.",
		"In a kingdom of mysteries and agony, in an era of illusion, a rascal and a barbarian attempt to solve the ultimate crime.",
		"In a demon-haunted land of warfare, in a time of prophecy and prophecy, four farmers and a conjurer search for fame and combat a mob of aliens intent on on taking over the world.",
		"In a forbidden land, in a time of doom, two chemists and a queen hope to find the cure for a deadly disease.",
		"In a kingdom of insanity, in an age of sorcery, three cyborgs and a theologian try to find justice and combat lawlessness.",
		"In a demon-haunted city, in an age of horror, six virtual reality programmers hope to save a kidnapped occultist.",
		"In an empire of dreams and mysteries, a gigolo seeks love and opposes terrorism.",
		"On a planet of insanity, six cyborgs hope to solve the ultimate crime.",
		"On a godforsaken world of insanity, in an era of computerization, two computer programmers and a bartender try to find the cure for a deadly disease.",
		"In a crime-infested empire, a farmer fights terrorism.",
		"In a universe of ghosts, in an age of enchantment, a virtual reality engineer and a dungeon delver hope to solve the ultimate crime.",
		"In a hellish land, in a time of blood and virutal reality, a magician combats terrorism.",
		"On a wicked planet of lost souls, two princesses try to save a kidnapped fletcher.",
		"In a hellish galaxy, two magicians and a grave robber combat corrupt politicians."
	]);
}

var getTwist = function(){
	return _.sample([
		"A character is shown to have a dangerous compulsion, this is revealed when someone has a psychic vision.",
		"A character suddenly falls out of love with the antagonist's twin.",
		"In order to fulfill their goals, a character must kill their true love - and they do it.",
		"Because of a time of political turmoil, the antagonist is revealed to be being manipulated by someone else",
		"Because of a tornado, the protagonist is revealed to be having their own hidden plans",
		"It's revealed that everything that is happening is in a hallucination. That's when everything becomes hilarious.",
		"We discover that, thanks to a sudden discovery, that a character has a mental illness.",
		"The antagonist discovers everyone else actually is addicted to a substance - this is due to a simple miscommunication.",
		"The antagonist thinks that everything happening a misinterpretation of something else - and this is due to being lied to by others.",
		"The antagonist discovers everyone else actually is an artifical life form.",
		"The lead suddenly reveals a witty side - which makes things much more complicated",
		"We discover that, thanks to a heartfelt confession, that a character is a clone.",
		"A string of numbers turns out to refer to a combination on a safe - which someone uses to their advantage.",
		"The alternate antagonist turns out to be the protagonist's brother.",
		"We discover that, once a specific name is analyzed, that everything is exactly what it seems - despite evidence to the contrary.",
		"A character suddenly falls in love with the antagonist - but this is due to a dangerous compulsion.",
		"Thanks to strange technology, the characters end up in the earth's future.",
		"The alternate antagonist turns out to be the alternate protagonist's father.",
		"In order to fulfill their goals, a character must betray their best friend - and they can't bring themselves to do it.",
		"The antagonist discovers everyone else actually is a demonic entity.",
		"A character suddenly falls in love with the secondary protagonist - this brings out magical gifts.",
		"The alternate protagonist turns out to be the antagonist's brother.",
		"What people think of as witchcraft is really genetic engineering.",
		"A supposedly accidental hug is actually caused by strange technology.",
		"The world is revealed to be dependent on nanotechnology.",
		"Because of a tornado, the antagonist is revealed to be being manipulated by someone else",
		"At the start of the story some money is introduced - and of course it is used by the story's end.",
		"A character is shown to have strange powers - this is revealed by a series of strange co-incidences.",
		"In order to fulfill their goals, a character must kill their aunt - and they do it.",
		"Because of a discovery, the secondary protagonist is revealed to be hallucinating."
	]);
}

var getReward = function(){
	return _.sample([
		'goat sac', '10 gold', '100 gold', '101 gold', 'curved horn', 'wand of wand creation',
		'bag of hand-holding', '1 copper', 'true friendship', 'magical stick'
	], _.random(1,5)).join(', ');
}



module.exports = function(monsterManual){

	return {
		name : getName(),
		desc : getPlot() + ' ' + getTwist(),
		reward : getReward(),
		enemies : _.sample(_.keys(monsterManual), _.random(2,6)),
		unique : {


		}
	}
}