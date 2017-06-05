const _ = require('lodash');
const Data = require('./random.data.js');


module.exports = {
	note : ()=>{
		return `{{note,red
##### ${Data.rand('abilities')}
${Data.rand('sentences', 6, 4).join(' ')}
}}`

	},

	altnote : ()=>{
		return `{{note,alt
##### ${Data.rand('abilities')}
${Data.rand('sentences', 6, 4).join(' ')}
}}`
	}


}