require('./text.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const { NUMBER_PATTERN, HINT_TYPE, PATTERNS, STYLE_FN, FIELD_TYPE, SNIPPET_TYPE } = require('../constants');
const CodeMirror = require('../../../code-mirror.js');

const Text = createClass({
	fieldRef : {},

	getDefaultProps : function() {
		return {
			field         : {},
			text          : '',
			n             : 0,
			setHints      : ()=>{},
			onChange      : ()=>{},
			getStyleHints : ()=>{},
			def           : false,
			snippetType   : -1
		};
	},

	getInitialState : function() {
		return {
			value : '',
			id    : ''
		};
	},

	componentDidUpdate : function({ text }, { value }) {
		if(this.props.text !== text) {
			const { field, n } = this.props;
			const pattern = PATTERNS.field[field.type](field.name);
			const [_, __, value] = this.props.text.match(pattern) ?? [];
			this.setState({
				value : value,
				id    : `${field?.name}-${n}`
			});
		}

		if(this.state.value !== value) {
			const { field } = this.props;
			this.props.setHints(this, field.hints ? this.props.getStyleHints(field, this.state.value) : []);
		}
	},

	componentDidMount : function() {
		const { field, text, n } = this.props;
		const id = `${field?.name}-${n}`;
		const pattern = PATTERNS.field[field.type](field.name);
		const [_, __, value] = text.match(pattern) ?? [];
		this.setState({
			value : value,
			id
		});
		this.fieldRef[id] = React.createRef();
	},

	componentWillUnmount : function() {
		this.fieldRef = undefined;
		this.fieldRef = {};
		this.fieldRef[this.state.id]?.remove();
	},

	setFocus : function(e) {
		const { type } = e;
		const { field } = this.props;
		this.props.setHints(this, type === 'focus' && field.hints ? this.props.getStyleHints(field, this.state.value) : []);
	},

	hintSelected : function(h, e) {
		let value;
		if(h?.type === HINT_TYPE.VALUE) {
			value = h.hint;
		} else if(h?.type === HINT_TYPE.NUMBER_SUFFIX) {
			const match = this.state.value.match(NUMBER_PATTERN);
			let suffix = match?.at(4) ?? '';
			for (const char of h.hint) {
				if(suffix.at(0) === char) {
					suffix = suffix.slice(1);
				}
			}
			value = `${match?.at(1) ?? ''}${match?.at(2) ?? ''}${h.hint}${suffix}`;
		}
		this.onChange({
			target : {
				value
			}
		});
	},
	keyDown : function(e) {
		const { code } = e;
		const { field } = this.props;
		const { value } = this.state;
		const match = value?.match(NUMBER_PATTERN);
		if(code === 'ArrowDown') {
			if(match && CSS.supports(field.name, value)) {
				e.preventDefault();
				this.onChange({
					target : {
						value : `${match.at(1) ?? ''}${Number(match[2]) - field.increment}${match[3] ?? ''}${match.at(4) ?? ''}`
					}
				});
			}
		} else if(code === 'ArrowUp') {
			if(match && CSS.supports(field.name, value)) {
				e.preventDefault();
				this.onChange({
					target : {
						value : `${match.at(1) ?? ''}${Number(match[2]) + field.increment}${match[3] ?? ''}${match.at(4) ?? ''}`
					}
				});
			}
		}
	},
	onChange : function (e){
		const { cm, text, field, n, snippetType } = this.props;
		const pattern = PATTERNS.field[field.type](field.name);
		const [_, label, current] = text.match(pattern) ?? [null, field.name, ''];
		let index = text.indexOf(`${label}:${current}`);
		let value = e.target.value;
		if(index === -1) {
			if(snippetType === SNIPPET_TYPE.INLINE) {
				index = text.indexOf('}');
			}
			index = index === -1 ? text.length : index;
			value = `,${field.name}:${value}`;
		} else {
			index = index + 1 + field.name.length;
		}
		cm.replaceRange(value, CodeMirror.Pos(n, index), CodeMirror.Pos(n, index + current.length), '+insert');
		this.setState({
			value : e.target.value,
		});
	},
	render : function() {
		const { value, id } = this.state;
		const { field, text, def } = this.props;
		const style = STYLE_FN(value);
		const pattern = PATTERNS.field[field.type](field.name);
		const [_, label, __] = text.match(pattern) ?? [null, undefined, ''];
		let className = 'widget-field';
		if(!label) {
			className += ' suggested';
		}
		if(def) {
			className += ' default';
		}
		return <React.Fragment>
			<div className={className}>
				<label htmlFor={id}>{field.name}:</label>
				<input id={id} type='text' value={value}
					   style={style}
					   ref={this.fieldRef[id]}
					   onChange={this.onChange}
					   onFocus={this.setFocus}
					   onBlur={this.setFocus}
					   onKeyDown={this.keyDown}/>
			</div>
		</React.Fragment>;
	}
});

module.exports = Text;