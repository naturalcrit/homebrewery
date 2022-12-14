const _ = require('lodash');

// Default brew properties in most cases
const DEFAULT_BREW = {
	text        : '',
	editId      : null,
	shareId     : null,
	title       : 'Untitled Brew',
	description : '',
	renderer    : 'V3',
	tags        : [],
	systems     : [],
	thumbnail   : '',
	published   : false,
	pageCount   : 1,
	theme       : '5ePHB'
};
//  Default brew properties for loading
const DEFAULT_BREW_LOAD = {};
_.defaults(DEFAULT_BREW_LOAD,
	{
		renderer  : 'legacy',
		published : true
	},
	DEFAULT_BREW);

module.exports = {
	DEFAULT_BREW,
	DEFAULT_BREW_LOAD
};