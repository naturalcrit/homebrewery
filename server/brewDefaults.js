import _ from 'lodash';

// Default properties for newly-created brews
const DEFAULT_BREW = {
	title        : '',
	text         : '',
	style        : undefined,
	description  : '',
	editId       : undefined,
	shareId      : undefined,
	createdAt    : undefined,
	updatedAt    : undefined,
	renderer     : 'V3',
	theme        : '5ePHB',
	authors      : [],
	tags         : [],
	lang         : 'en',
	thumbnail    : '',
	views        : 0,
	published    : false,
	pageCount    : 1,
	gDrive       : false,
	trashed      : false,
	bleed        : { top: '.125in', bottom: '.125in', inner: '.125in', outer: '.125in' },
	safetySpace  : { top: '.25in', bottom: '.25in', outer: '.25in', inner: '.5in' },
	trimSize     : { width: '8.5in', height: '11in' },
	columns      : '2',
	columnGutter : '.125in',
	license      : 'None',
	legalAuthors : ''
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
