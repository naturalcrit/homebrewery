const _ = require('lodash');
const { SNIPPET_TYPE, FIELD_TYPE, fourDigitNumberFromValue } = require('../../../shared/naturalcrit/codeEditor/helpers/widget-elements/constants');

module.exports = [{
	name   : 'monster',
	type   : SNIPPET_TYPE.BLOCK,
	fields : [{
		name : 'frame',
		type : FIELD_TYPE.CHECKBOX
	}, {
		name : 'wide',
		type : FIELD_TYPE.CHECKBOX
	}]
}, {
	name   : 'classTable',
	type   : SNIPPET_TYPE.BLOCK,
	fields : [{
		name : 'frame',
		type : FIELD_TYPE.CHECKBOX
	}, {
		name : 'decoration',
		type : FIELD_TYPE.CHECKBOX
	}, {
		name : 'wide',
		type : FIELD_TYPE.CHECKBOX
	}]
}, {
	name   : 'runeTable',
	type   : SNIPPET_TYPE.BLOCK,
	fields : [{
		name : 'frame',
		type : FIELD_TYPE.CHECKBOX
	}, {
		name : 'wide',
		type : FIELD_TYPE.CHECKBOX
	}, {
		name : 'font-family',
		type : FIELD_TYPE.TEXT
	}]
}, {
	name   : 'index',
	type   : SNIPPET_TYPE.BLOCK,
	fields : [{
		name : 'wide',
		type : FIELD_TYPE.CHECKBOX
	}, {
		name      : 'columns',
		type      : FIELD_TYPE.TEXT,
		increment : 1
	}]
}, {
	name   : 'image',
	type   : SNIPPET_TYPE.INJECTOR,
	fields : []
}, {
	name   : 'artist',
	type   : SNIPPET_TYPE.BLOCK,
	fields : [{
		name      : 'top',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
		hints     : true
	}]
}, {
	name   : 'watercolor',
	type   : SNIPPET_TYPE.INLINE,
	fields : [{
		name    : 'watercolor',
		type    : FIELD_TYPE.IMAGE_SELECTOR,
		preview : (value)=>`/assets/watercolor/watercolor${value}.png`,
		values  : _.range(1, 13)
	}, {
		name      : 'top',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
		hints     : true
	}, {
		name      : 'left',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
		hints     : true
	}, {
		name      : 'width',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
		hints     : true
	}, {
		name      : 'opacity',
		type      : FIELD_TYPE.TEXT,
		increment : 5
	}, {
		name : 'background-color',
		type : FIELD_TYPE.COLOR_SELECTOR,
	}]
}, {
	name   : 'imageMaskCenter',
	type   : SNIPPET_TYPE.INLINE,
	fields : [{
		name    : 'imageMaskCenter',
		type    : FIELD_TYPE.IMAGE_SELECTOR,
		preview : (value)=>`/assets/waterColorMasks/center/${fourDigitNumberFromValue(value)}.webp`,
		values  : _.range(1, 17)
	}, {
		name      : '--offsetX',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
	}, {
		name      : '--offsetY',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
	}, {
		name      : '--rotation',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
	}]
}, {
	name   : 'imageMaskEdge',
	type   : SNIPPET_TYPE.INLINE,
	fields : [{
		name    : 'imageMaskEdge',
		type    : FIELD_TYPE.IMAGE_SELECTOR,
		preview : (value)=>`/assets/waterColorMasks/edge/${fourDigitNumberFromValue(value)}.webp`,
		values  : _.range(1, 9)
	}, {
		name      : '--offset',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
	}, {
		name      : '--rotation',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
	}]
}, {
	name   : 'imageMaskCorner',
	type   : SNIPPET_TYPE.INLINE,
	fields : [{
		name    : 'imageMaskCorner',
		type    : FIELD_TYPE.IMAGE_SELECTOR,
		preview : (value)=>`/assets/waterColorMasks/corner/${fourDigitNumberFromValue(value)}.webp`,
		values  : _.range(1, 38)
	}, {
		name      : '--offsetX',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
	}, {
		name      : '--offsetY',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
	}, {
		name      : '--rotation',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
	}]
}];
