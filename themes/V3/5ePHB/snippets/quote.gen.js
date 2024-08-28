const _ = require('lodash');

const quotes = [
	'The sword glinted in the dim light, its edges keen and deadly. As the adventurer reached for it, he couldn\'t help but feel a surge of excitement mixed with fear. This was no ordinary blade.',
	'The dragon\'s roar shook the ground beneath their feet, and the brave knight stood tall, his sword at the ready. He knew that this would be the battle of his life, but he was determined to emerge victorious.',
	'The wizard\'s laboratory was a sight to behold, filled with bubbling cauldrons, ancient tomes, and strange artifacts from distant lands. As the apprentice gazed around in wonder, she knew that she was about to embark on a journey unlike any other.',
	'The tavern was packed with rowdy patrons, their voices raised in song and laughter. The bard took center stage, strumming his lute and launching into a tale of adventure and heroism that had the crowd hanging on his every word.',
	'The thief crept through the shadows, his eyes scanning the room for any sign of danger. He knew that one false move could mean the difference between success and failure, and he was determined to come out on top.',
	'The elf queen stood atop her castle walls, surveying the kingdom below with a mix of pride and sadness. She knew that the coming war would be brutal, but she was determined to protect her people at all costs.',
	'The necromancer\'s tower loomed in the distance, its dark spires piercing the sky. As the adventurers approached, they could feel the chill of death emanating from within',
	'The ranger moved through the forest like a shadow, his senses attuned to every sound and movement around him. He knew that danger lurked behind every tree, but he was ready for whatever came his way.',
	'The paladin knelt before the altar, his hands clasped in prayer. He knew that his faith would be tested in the days ahead, but he was ready to face whatever trials lay in store for him.',
	'The druid communed with the spirits of nature, his mind merging with the trees, the animals, and the very earth itself. He knew that his power came with a great responsibility, and he was determined to use it for the greater good.',
];

const authors = [
	'Unknown',
	'James Wyatt',
	'Eolande Blackwood',
	'Ragnar Ironheart',
	'Lyra Nightshade',
	'Valtorius Darkstar',
	'Isadora Fireheart',
	'Theron Shadowbane',
	'Lirien Starweaver',
	'Drogathar Bonecrusher',
	'Kaelen Frostblade',
];

const books = [
	'The Blade of Destiny',
	'Dragonfire and Steel',
	'The Bard\'s Tale',
	'Darkness Rising',
	'The Sacred Quest',
	'Shadows in the Forest',
	'The Starweaver Chronicles',
	'Beneath the Bones',
	'Moonlit Magic',
	'Frost and Fury',

];
module.exports = ()=>{
	return `
{{quote
${_.sample(quotes)}

{{attribution ${_.sample(authors)}, *${_.sample(books)}*}}
}}
\n`;
};
