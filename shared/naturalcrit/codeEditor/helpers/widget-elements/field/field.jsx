require('./field.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const { UNITS } = require('../constants');

const Field = createClass({
	hintsRef      : React.createRef(),
	activeHintRef : React.createRef(),

	getDefaultProps : function() {
		return {
			field    : {},
			n        : 0,
			value    : '',
			hints    : [],
			onChange : ()=>{}
		};
	},

	getInitialState : function() {
		return {
			value      : '',
			focused    : false,
			activeHint : null
		};
	},

	componentDidUpdate : function({ hints }) {
		if(this.state.value !== this.props.value) {
			this.setState({
				value : this.props.value
			});
		}

		const hintsLength = this.props.hints.length;
		if(hintsLength - 1 < this.state.activeHint && hintsLength !== hints.length) {
			this.setState({
				activeHint : hintsLength === 0 ? 0 : hintsLength - 1
			});
			return;
		}

		if(this.hintsRef.current && this.activeHintRef.current) {
			const offset = this.activeHintRef.current.offsetTop;
			const scrollTop = this.hintsRef.current.scrollTop;
			if(scrollTop + 50 < offset || scrollTop + 50 > offset) {
				this.hintsRef.current.scrollTo({
					top      : offset - 50,
					behavior : 'smooth'
				});
			}
		}
	},

	componentDidMount : function() {
		this.setState({
			value : this.props.value
		});
	},

	change : function(e) {
		this.props.onChange(e);
		this.setState({
			value : e.target.value
		});
	},

	setFocus : function({ type }) {
		if(type === 'focus') {
			this.setState({ focused: true, activeHint: this.props.hints.length > 0 ? 0 : null });
		} else if(type === 'blur'){
			this.setState({ focused: false, activeHint: null });
		}
	},

	keyDown : function(e) {
		const { code } = e;
		const { value, activeHint } = this.state;
		const { field, hints } = this.props;
		const numberPattern = new RegExp(`([^-\\d]*)([-\\d]+)(${UNITS.join('|')})(.*)`);
		const match = value.match(numberPattern);
		if(code === 'ArrowDown') {
			e.preventDefault();
			if(match) {
				this.change({
					target : {
						value : `${match.at(1) ?? ''}${Number(match[2]) - field.increment}${match[3]}${match.at(4) ?? ''}`
					}
				});
			} else {
				this.setState({
					activeHint : activeHint === hints.length - 1 ? 0 : activeHint + 1
				});
			}
		} else if(code === 'ArrowUp') {
			e.preventDefault();
			if(match) {
				this.change({
					target : {
						value : `${match.at(1) ?? ''}${Number(match[2]) + field.increment}${match[3]}${match.at(4) ?? ''}`
					}
				});
			} else {
				this.setState({
					activeHint : activeHint === 0 ? hints.length - 1 : activeHint - 1
				});
			}
		} else if(code === 'Enter') {
			e.preventDefault();
			if(!match) {
				this.change({
					target : {
						value : hints[activeHint]
					}
				});
				this.setState({
					activeHint : 0
				});
			}
		}
	},

	render : function(){
		const { focused, value, activeHint } = this.state;
		const { field, n } = this.props;
		const hints = this.props.hints
			.filter((h)=>h!==value)
			.map((h, i)=>{
				if(activeHint === i) {
					return <div key={i} className={'hint active'} onClick={()=>this.change({ target: { value: h } })} ref={this.activeHintRef}>{h}</div>;
				} else {
					return <div key={i} className={'hint'} onClick={()=>this.change({ target: { value: h } })}>{h}</div>;
				}
			});

		const id = `${field.name}-${n}`;
		return <React.Fragment>
			<div className='widget-field'>
				<label htmlFor={id}>{_.startCase(field.name)}:</label>
				<input id={id} type='text' value={value} step={field.increment || 1} onChange={this.change} onFocus={this.setFocus} onBlur={this.setFocus} onKeyDown={this.keyDown}/>
				{focused ?
					<div className='hints' ref={this.hintsRef}>
						{hints}
					</div> :
					null
				}

			</div>
		</React.Fragment>;
	}
});

module.exports = Field;