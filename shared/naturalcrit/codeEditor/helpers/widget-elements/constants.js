const _ = require('lodash');

export const UNITS = ['cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%'];

export const HINT_TYPE = {
	VALUE         : 0,
	NUMBER_SUFFIX : 1
};

export const SNIPPET_TYPE = {
	BLOCK    : 0,
	INLINE   : 1,
	INJECTOR : 2,
};

export const FIELD_TYPE = {
	TEXT           : 0,
	CHECKBOX       : 1,
	IMAGE_SELECTOR : 2,
	COLOR_SELECTOR : 3,
};

const textField = (name)=>new RegExp(`[{,;](${name}):([^};,"\\(]*\\((?!,)[^};"\\)]*\\)|"[^},;"]*"|[^},;]*)`);
export const PATTERNS = {
	snippet : {
		[SNIPPET_TYPE.BLOCK]    : (name)=>new RegExp(`^{{${name}(?:[^a-zA-Z].*)?`),
		[SNIPPET_TYPE.INLINE]   : (name)=>new RegExp(`{{${name}`),
		[SNIPPET_TYPE.INJECTOR] : ()=>new RegExp(`^\\!\\[(?:[a-zA-Z -]+)?\\]\\(.*\\).*{[a-zA-Z0-9:, "'-]+}$`),
	},
	field : {
		[FIELD_TYPE.TEXT]           : textField,
		[FIELD_TYPE.IMAGE_SELECTOR] : (name)=>new RegExp(`{{(${name})(\\d*)`),
		[FIELD_TYPE.COLOR_SELECTOR] : textField
	},
	collectStyles : new RegExp(`(?:([a-zA-Z-]+):(?!\\/))+`, 'g'),
};

export const NUMBER_PATTERN = new RegExp(`([^-\\d]*)([-\\d]+)(${UNITS.join('|')})?(.*)`);

export const fourDigitNumberFromValue = (value)=>typeof value === 'number' ? (()=>{
	const str = String(value);
	return _.range(0, 4 - str.length).map(()=>'0').join('') + str;
})() : value;

const DEFAULT_WIDTH = '30px';

export const STYLE_FN = (value, extras = {})=>({
	width : `calc(${value?.length ?? 0}ch + ${value?.length ? `${DEFAULT_WIDTH} / 2` : DEFAULT_WIDTH})`,
	...extras
});