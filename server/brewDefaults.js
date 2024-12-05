import _ from 'lodash';

// Default properties for newly-created brews
const DEFAULT_BREW = {
	title       : '',
	text        : '',
	style       : undefined,
	description : '',
	editId      : undefined,
	shareId     : undefined,
	createdAt   : undefined,
	updatedAt   : undefined,
	renderer    : 'V3',
	theme       : '5ePHB',
	authors     : [],
	tags        : [],
	systems     : [],
	lang        : 'en',
	thumbnail   : '',
	views       : 0,
	published   : false,
	pageCount   : 1,
	gDrive      : false,
	trashed     : false

};
// Default values for older brews with missing properties
// e.g., missing "renderer" is assumed to be "legacy"
const DEFAULT_BREW_LOAD = _.defaults(
	{
		renderer : 'legacy',
	},
	DEFAULT_BREW);

export {
	DEFAULT_BREW,
	DEFAULT_BREW_LOAD
};
