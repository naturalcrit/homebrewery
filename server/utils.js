const _ = require('lodash');


module.exports = {
	getGoodBrewTitle : (text = '') => {
		const titlePos = text.indexOf('# ');
		if(titlePos !== -1){
			let ending = text.indexOf('\n', titlePos);
			ending = (ending == -1 ? undefined : ending);
			return text.substring(titlePos + 2, ending).trim();
		}else{
			return (_.find(text.split('\n'), (line)=>{
				return line;
			}) || '').trim();
		}
	},
	replaceByMap : (text, mapping) => {
		return _.reduce(mapping, (r, search, replace) => {
			return r.split(search).join(replace)
		}, text)
	}

}