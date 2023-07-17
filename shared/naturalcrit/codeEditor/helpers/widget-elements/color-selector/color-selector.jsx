require('./color-selector.less');
const React = require('react');
const createClass = require('create-react-class');
const { PATTERNS, STYLE_FN } = require('../constants');
const CodeMirror = require('../../../code-mirror');
const debounce = require('lodash.debounce');

const ColorSelector = createClass({
	getDefaultProps : function() {
		return {
			field : {},
			cm    : {},
			n     : undefined,
			text  : '',
			def   : false
		};
	},
	getInitialState : function() {
		return {
			value : ''
		};
	},
	componentDidMount : function() {
		const { field, text } = this.props;
		const pattern = PATTERNS.field[field.type](field.name);
		const [_, __, value] = text.match(pattern) ?? [];
		this.setState({
			value : value,
		});
	},
	componentDidUpdate({ text }) {
		const { field } = this.props;
		if(this.props.text !== text) {
			const pattern = PATTERNS.field[field.type](field.name);
			const [_, __, value] = this.props.text.match(pattern) ?? [];
			this.setState({
				value,
			});
		}
	},
	onChange : function(e) {
		const { cm, text, field, n } = this.props;
		const pattern = PATTERNS.field[field.type](field.name);
		const [_, label, current] = text.match(pattern) ?? [null, field.name, ''];
		let index = text.indexOf(`${label}:${current}`);
		while (index !== -1 && text[index - 1] === '-') {
			index = text.indexOf(`${label}:${current}`, index + 1);
		}
		let value = e.target.value;
		if(index === -1) {
			index = text.length;
			value = `,${field.name}:${value}`;
		} else {
			index = index + 1 + field.name.length;
		}
		cm.replaceRange(value, CodeMirror.Pos(n, index), CodeMirror.Pos(n, index + current.length), '+insert');
		this.setState({
			value : e.target.value,
		});
	},
	debounce         : debounce((self, e)=>self.onChange(e), 300),
	onChangeDebounce : function(e) {
		this.setState({
			value : e.target.value,
		});
		this.debounce(this, e);
	},
	render : function() {
		const { field, n, text, def } = this.props;
		const { value } = this.state;
		const style = STYLE_FN(value);
		const id = `${field?.name}-${n}`;
		const pattern = PATTERNS.field[field.type](field.name);
		const [_, label, __] = text.match(pattern) ?? [null, undefined, ''];
		let className = 'widget-field color-selector';
		if(!label) {
			className += ' suggested';
		}
		if(def) {
			className += ' default';
		}
		return <React.Fragment>
			<div className={className}>
				<label htmlFor={id}>{field.name}:</label>
				<input className='color' type='color' value={value} onChange={this.onChangeDebounce}/>
				<input id={id} className='text' type='text' style={style} value={value} onChange={this.onChange}/>
			</div>
		</React.Fragment>;
	}
});

module.exports = ColorSelector;