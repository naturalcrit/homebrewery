const _ = require('lodash');

const Utils = {
	controlKeys : (mapping) => {
		return (e) => {
			if(!(e.ctrlKey || e.metaKey)) return;
			if(typeof mapping[e.key] === 'function'){
				mapping[e.key]();
				e.stopPropagation();
				e.preventDefault();
			}
		}
	},

};

module.exports = Utils;