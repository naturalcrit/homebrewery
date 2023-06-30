const { WIDGET_TYPE, FIELD_TYPE } = require('../../../shared/naturalcrit/codeEditor/helpers/widget-elements/constants');

module.exports = [{
	name    : 'monster',
	type    : WIDGET_TYPE.SNIPPET,
	classes : ['frame', 'wide']
}, {
	name    : 'classTable',
	type    : WIDGET_TYPE.SNIPPET,
	classes : ['frame', 'decoration', 'wide']
}, {
	name   : 'image',
	type   : WIDGET_TYPE.IMAGE,
	fields : []
}, {
	name   : 'artist',
	type   : WIDGET_TYPE.SNIPPET,
	fields : [{
		name      : 'top',
		type      : FIELD_TYPE.STYLE,
		increment : 5,
		lineBreak : true
	}]
}];