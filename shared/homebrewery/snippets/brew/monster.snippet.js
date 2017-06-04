const _ = require('lodash');
const Data = require('./random.data.js');


const getStats = function(){
	return '|' + _.times(6, function(){
		const num = _.random(1,20);
		const mod = Math.ceil(num/2 - 5)
		return num + " (" + (mod >= 0 ? '+'+mod : mod ) + ")"
	}).join('|') + '|';
}

const getAttributes = ()=>{

	return `
- **Saving Throws**
- **Condition Immunities** ${Data.rand(["groggy", "swagged", "weak-kneed", "buzzed", "groovy", "melancholy", "drunk"], 3).join(', ')},
- **Senses** passive Perception " ${_.random(3, 20)},
- **Languages** ${Data.rand(["Common", "Pottymouth", "Gibberish", "Latin", "Jive"], 2).join(', ')}
- **Challenge** ${_.random(0, 15)} (${_.random(10,10000)} XP)
`;

}

const getAbilities = ()=>{

}

const getActions = ()=>{


}


module.exports = {
	monster : ()=>{

		const stats = '';

		return `{{monster
## ${Data.rand('creatures')}
*${Data.rand('sizes')}, ${Data.rand('alignments')}*

---
- **Armor Class** ${_.random(10,20)}
- **Hit Points** ${_.random(1, 150)} (1d4 + 5)
- **Speed** ${ _.random(0,50)} ft
---
|STR|DEX|CON|INT|WIS|CHA|
|:---:|:---:|:---:|:---:|:---:|:---:|
${getStats()}
---
${getAttributes()}
---
Abilities


### Actions

}}`


	}
};