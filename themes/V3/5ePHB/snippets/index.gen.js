const dedent = require('dedent-tabs').default;

module.exports = () => {
  return dedent`
	{{index,wide,columns:5;
	##### Index
	- Ankh-Morpork
	  - city map, 7
	  - city watch, 12
	  - guilds, 19
	- Cheese
	  - types of cheese, 8
	  - cheese-related magic, 14
	  - cheese-related quests, 26-27
	- Death
	  - appearance, 10
	  - personality, 13
	  - hobbies, 23
	- Elves
	  - types of elves, 15
	  - elvish magic, 24
	  - elvish curses, 28
	- Footnotes
	  - types of footnotes, 16-17
	  - footnote rules, 20-21
	  - footnote humor, 29-30
	- Gods
	  - types of gods, 12
	  - godly interventions, 25
	  - godly conflicts, 31
	- Heroes
	  - class features, 11-12
	  - heroic deeds, 26-27
	- Inns
	  - types of inns, 9
	  - inn amenities, 18
	- Jokes
	  - types of jokes,11-12 
	  - joke delivery,25 
	- Knives 
	  - types of knives,16-17 
	  - knife skills,22-23 
	  - knife fights,28-29 
	- Luggage 
	  - appearance,10 
	  - personality,13 
	  - abilities,23 
	- Magic 
	  - types of magic,15 
	  - magic rules,24 
	  - magic mishaps,28
	}}`;
};