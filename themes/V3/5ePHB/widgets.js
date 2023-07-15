const { SNIPPET_TYPE, FIELD_TYPE } = require('../../../shared/naturalcrit/codeEditor/helpers/widget-elements/constants');

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
}];