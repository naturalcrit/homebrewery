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
};

export const PATTERNS = {
	snippet : {
		[SNIPPET_TYPE.BLOCK]    : (name)=>new RegExp(`^{{${name}(?:[^a-zA-Z].*)?`),
		[SNIPPET_TYPE.INLINE]   : (name)=>new RegExp(`{{${name}`),
		[SNIPPET_TYPE.INJECTOR] : ()=>new RegExp(`^\\!\\[(?:[a-zA-Z -]+)?\\]\\(.*\\).*{[a-zA-Z0-9:, "'-]+}$`),
	},
	field : {
		[FIELD_TYPE.TEXT]           : (name)=>new RegExp(`[{,;](${name}):([^};,"\\(]*\\((?!,)[^};"\\)]*\\)|"[^},;"]*"|[^},;]*)`),
		[FIELD_TYPE.IMAGE_SELECTOR] : (name)=>new RegExp(`{{(${name})(\\d*)`),
	},
	collectStyles : new RegExp(`(?:([a-zA-Z-]+):(?!\\/))+`, 'g'),
};

export const NUMBER_PATTERN = new RegExp(`([^-\\d]*)([-\\d]+)(${UNITS.join('|')})?(.*)`);
