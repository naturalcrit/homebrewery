const _ = require('lodash');



module.exports = {
	getGoodBrewTitle : (text) => {
		const titlePos = text.indexOf('# ');
		if(titlePos !== -1){
			const ending = text.indexOf('\n', titlePos);
			return text.substring(titlePos + 2, ending);
		}else{
			return _.find(text.split('\n'), (line)=>{
				return line;
			});
		}
	},
	replaceByMap : (text, mapping) => {
		return _.reduce(mapping, (r, search, replace) => {
			return r.split(search).join(replace)
		}, text)
	}

}