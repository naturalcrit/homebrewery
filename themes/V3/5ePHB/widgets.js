const { SNIPPET_TYPE, FIELD_TYPE } = require('../../../shared/naturalcrit/codeEditor/helpers/widget-elements/constants');

module.exports = [{
	name   : 'monster',
	type   : SNIPPET_TYPE.DEFAULT,
	fields : [{
		name : 'frame',
		type : FIELD_TYPE.CHECKBOX
	}, {
		name : 'wide',
		type : FIELD_TYPE.CHECKBOX
	}]
}, {
	name   : 'classTable',
	type   : SNIPPET_TYPE.DEFAULT,
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
	type   : SNIPPET_TYPE.IMAGE,
	fields : []
}, {
	name   : 'artist',
	type   : SNIPPET_TYPE.DEFAULT,
	fields : [{
		name      : 'top',
		type      : FIELD_TYPE.TEXT,
		increment : 5,
		hints     : true
	}]
}];