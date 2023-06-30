export const UNITS = ['cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%'];

export const HINT_TYPE = {
	VALUE         : 0,
	NUMBER_SUFFIX : 1
};

export const WIDGET_TYPE = {
	SNIPPET        : 0,
	INLINE_SNIPPET : 1,
	IMAGE          : 2,
};

export const FIELD_TYPE = {
	STYLE : 0
};

export const PATTERNS = {
	widget : {
		[WIDGET_TYPE.SNIPPET]        : (name)=>new RegExp(`^{{${name}(?:[^a-zA-Z].*)?`),
		[WIDGET_TYPE.INLINE_SNIPPET] : (name)=>new RegExp(`{{${name}`),
		[WIDGET_TYPE.IMAGE]          : ()=>new RegExp(`^\\!\\[(?:[a-zA-Z -]+)?\\]\\(.*\\).*{[a-zA-Z0-9:, "'-]+}$`),
	},
	field : {
		[FIELD_TYPE.STYLE] : (name)=>new RegExp(`[{,;](${name}):("[^},;"]*"|[^},;]*)`),
	},
	collectStyles : new RegExp(`(?:([a-zA-Z-]+):)+`, 'g'),
};

export const NUMBER_PATTERN = new RegExp(`([^-\\d]*)([-\\d]+)(${UNITS.join('|')})?(.*)`);
