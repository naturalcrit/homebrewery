const _ = require('lodash');

const itemNames = [
	'Doorknob of Niceness'
];

module.exports = {

		return [
		    `#### ${_.sample(itemNames)}`,
            `*${_.sample(['Wondrous item', 'Armor', 'Weapon'])}, ${_.sample(['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'])} (requires attunement)*`,
            `<div style='margin-top:-2px'></div>`,
            `This knob is pretty nice. It opens the door you put it on.`
			`*${_.sample(level)}-level ${_.sample(spellSchools)}*`
		].join('\n');
	}
};
