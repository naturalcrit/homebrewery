const _ = require('lodash');
const Data = require('./random.data.js');


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
${stats}

---

- **Condition Immunities** " + genList(["groggy", "swagged", "weak-kneed", "buzzed", "groovy", "melancholy", "drunk"], 3),
- **Senses** passive Perception " + _.random(3, 20),
- **Languages** " + genList(["Common", "Pottymouth", "Gibberish", "Latin", "Jive"], 2),
- **Challenge** " + _.random(0, 15) + " (" + _.random(10,10000)+ " XP)",


}}`


	}
};