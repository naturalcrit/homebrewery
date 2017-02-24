const _ = require('lodash');

const process = (imports)=>{

};

module.exports = {
	phb : _.keyBy([
		require('./spell.snippet.js')
	], (spt)=>_.snakeCase(spt.name)),


}