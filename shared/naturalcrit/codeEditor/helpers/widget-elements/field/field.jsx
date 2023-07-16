require('./field.less');
const React = require('react');
const ReactDOM = require('react-dom');
const createClass = require('create-react-class');
const _ = require('lodash');
const { NUMBER_PATTERN, HINT_TYPE } = require('../constants');

const DEFAULT_WIDTH = '30px';

const STYLE_FN = (value)=>({
	width : `calc(${value?.length ?? 0}ch + ${value?.length ? `${DEFAULT_WIDTH} / 2` : DEFAULT_WIDTH})`
});

const Field = createClass({
	fieldRef : {},

	getDefaultProps : function() {
		return {
			field         : {},
			n             : 0,
			value         : '',
			setHints      : ()=>{},
			onChange      : ()=>{},
			getStyleHints : ()=>{}
		};
	},

	getInitialState : function() {
		return {
			value : '',
			style : STYLE_FN(),
			id    : ''
		};
	},

	componentDidUpdate : function(_, { value }) {
		if(this.state.value !== this.props.value) {
			this.setState({
				value : this.props.value,
				style : STYLE_FN(this.props.value),
				id    : `${this.props.field?.name}-${this.props.n}`
			});
			return;
		}

		if(this.state.value !== value) {
			this.props.setHints(this, this.props.getStyleHints(this.props.field, this.state.value));
		}
	},

	componentDidMount : function() {
		const id = `${this.props.field?.name}-${this.props.n}`;
		this.setState({
			value : this.props.value,
			style : STYLE_FN(this.props.value),
			id
		});
		this.fieldRef[id] = React.createRef();
	},

	componentWillUnmount : function() {
		this.fieldRef = undefined;
		this.fieldRef = {};
	},

	change : function(e) {
		this.props.onChange(e);
		this.setState({
			value : e.target.value,
			style : STYLE_FN(e.target.value)
		});
	},

	setFocus : function(e) {
		const { type } = e;
		this.props.setHints(this, type === 'focus' ? this.props.getStyleHints(this.props.field, this.state.value) : []);
	},

	hintSelected : function(h, e) {
		let value;
		if(h.type === HINT_TYPE.VALUE) {
			value = h.hint;
		} else if(h.type === HINT_TYPE.NUMBER_SUFFIX) {
			const match = this.state.value.match(NUMBER_PATTERN);
			let suffix = match?.at(4) ?? '';
			for (const char of h.hint) {
				if(suffix.at(0) === char) {
					suffix = suffix.slice(1);
				}
			}
			value = `${match?.at(1) ?? ''}${match?.at(2) ?? ''}${h.hint}${suffix}`;
		}
		this.change({
			target : {
				value
			}
		});
	},
	keyDown : function(e) {
		const { code } = e;
		const { field, value } = this.props;
		const match = value.match(NUMBER_PATTERN);
		if(code === 'ArrowDown') {
			if(match && match[3]) {
				e.preventDefault();
				this.change({
					target : {
						value : `${match.at(1) ?? ''}${Number(match[2]) - field.increment}${match[3]}${match.at(4) ?? ''}`
					}
				});
			}
		} else if(code === 'ArrowUp') {
			if(match && match[3]) {
				e.preventDefault();
				this.change({
					target : {
						value : `${match.at(1) ?? ''}${Number(match[2]) + field.increment}${match[3]}${match.at(4) ?? ''}`
					}
				});
			}
		}
	},
	render : function() {
		const { value, id } = this.state;
		const { field } = this.props;

		return <React.Fragment>
			<div className='widget-field'>
				<label htmlFor={id}>{_.startCase(field.name)}:</label>
				<input id={id} type='text' value={value}
					   step={field.increment || 1}
					   style={this.state.style}
					   ref={this.fieldRef[id]}
					   onChange={this.change}
					   onFocus={this.setFocus}
					   onBlur={this.setFocus}
					   onKeyDown={this.keyDown}/>
			</div>
		</React.Fragment>;
	}
});

module.exports = Field;