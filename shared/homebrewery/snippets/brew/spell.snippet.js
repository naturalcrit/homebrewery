const _ = require('lodash');
const Data = require('./random.data.js');


const levels = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
const schools = ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation'];



module.exports = {
	spell : ()=>{

		let components = _.sampleSize(['V', 'S', 'M'], _.random(1,3)).join(', ');
		if(components.indexOf('M') !== -1){
			components += ` (${Data.rand('gear',3).join(', ')})`
		}

		const duration = _.sample([
			'Until dispelled',
			'1 round',
			'Instantaneous',
			'Concentration, up to 10 minutes',
			'1 hour'
		]);

		const description = Data.rand('effects', 2).concat(Data.rand('effects2')).join(' ');


		return `{{spell
#### ${_.sample(Data.spellNames)}
*${_.sample(levels)}-level ${_.sample(schools)}*
- **Casting Time:** ${_.sample(['1 action', 'Reaction', '10 minutes', '1 hour'])}
- **Range:** ${_.sample(['Self', 'Touch', '30 feet', '60 feet'])}
- **Components:** ${components}
- **Duration:** ${duration}

${description}
}}`;

	}
}