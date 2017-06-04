var _ = require('lodash');

module.exports = function(classname){

	var classname = classname || _.sample(['archivist', 'fancyman', 'linguist', 'fletcher',
			'notary', 'berserker-typist', 'fishmongerer', 'manicurist', 'haberdasher', 'concierge'])

	classname = classname.toLowerCase();

	var hitDie = _.sample([4, 6, 8, 10, 12]);

	var abilityList = ["Strength", "Dexerity", "Constitution", "Wisdom", "Charisma", "Intelligence"];
	var skillList = ["Acrobatics ", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"];


	return [
		"## Class Features",
		"As a " + classname + ", you gain the following class features",
		"#### Hit Points",
		"___",
		"- **Hit Dice:** 1d" + hitDie + " per " + classname + " level",
		"- **Hit Points at 1st Level:** " + hitDie + " + your Constitution modifier",
		"- **Hit Points at Higher Levels:** 1d" + hitDie + " (or " + (hitDie/2 + 1) + ") + your Constitution modifier per " + classname + " level after 1st",
		"",
		"#### Proficiencies",
		"___",
		"- **Armor:** " + (_.sampleSize(["Light armor", "Medium armor", "Heavy armor", "Shields"], _.random(0,3)).join(', ') || "None"),
		"- **Weapons:** " + (_.sampleSize(["Squeegee", "Rubber Chicken", "Simple weapons", "Martial weapons"], _.random(0,2)).join(', ') || "None"),
		"- **Tools:** " + (_.sampleSize(["Artian's tools", "one musical instrument", "Thieve's tools"], _.random(0,2)).join(', ') || "None"),
		"",
		"___",
		"- **Saving Throws:** " + (_.sampleSize(abilityList, 2).join(', ')),
		"- **Skills:** Choose two from " + (_.sampleSize(skillList, _.random(4, 6)).join(', ')),
		"",
		"#### Equipment",
		"You start with the following equipment, in addition to the equipment granted by your background:",
		"- *(a)* a martial weapon and a shield or *(b)* two martial weapons",
		"- *(a)* five javelins or *(b)* any simple melee weapon",
		"- " + (_.sample(["10 lint fluffs", "1 button", "a cherished lost sock"])),
		"\n\n\n"
	].join('\n');
}
