const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
require('./checkbox.less');
const CodeMirror = require('../../../code-mirror.js');

const Checkbox = createClass({
	getDefaultProps : function() {
		return {
			value  : '',
			prefix : '',
			cm     : {},
			n      : -1
		};
	},

	handleChange : function (e) {
		const { cm, n, value, prefix } = this.props;
		const { text } = cm.lineInfo(n);
		const updatedPrefix = `{{${prefix}`;
		if(e.target?.checked)
			cm.replaceRange(`,${value}`, CodeMirror.Pos(n, updatedPrefix.length), CodeMirror.Pos(n, updatedPrefix.length), '+insert');
		else {
			const start = text.indexOf(`,${value}`);
			if(start > -1)
				cm.replaceRange('', CodeMirror.Pos(n, start), CodeMirror.Pos(n, start + value.length + 1), '-delete');
		}
	},

	render : function() {
		const { cm, n, value, prefix } = this.props;
		const { text } = cm.lineInfo(n);
		const id = [prefix, value, n].join('-');
		return <React.Fragment>
			<div className='widget-checkbox'>
				<input type='checkbox' id={id} onChange={this.handleChange} checked={_.includes(text, `,${value}`)}/>
				<label htmlFor={id}>{_.startCase(value)}</label>
			</div>
		</React.Fragment>;
	}
});

module.exports = Checkbox;