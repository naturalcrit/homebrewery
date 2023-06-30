const React = require('react');
const ReactDOM = require('react-dom');
const createClass = require('create-react-class');
const _ = require('lodash');
const { NUMBER_PATTERN } = require('../constants');

const Hints = createClass({
	hintsRef      : React.createRef(),
	activeHintRef : React.createRef(),

	getDefaultProps : function() {
		return {
			hints : [],
			field : undefined,
		};
	},

	getInitialState : function() {
		return {
			activeHint : 0
		};
	},

	componentDidUpdate : function({ hints }) {
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
	},

	keyDown : function(e) {
		const { code } = e;
		const { activeHint } = this.state;
		const { hints, field } = this.props;
		const match = field.state.value.match(NUMBER_PATTERN);
		if(code === 'ArrowDown') {
			e.preventDefault();
			if(!match) {
				this.setState({
					activeHint : activeHint === hints.length - 1 ? 0 : activeHint + 1
				});
			}
		} else if(code === 'ArrowUp') {
			e.preventDefault();
			if(!match) {
				this.setState({
					activeHint : activeHint === 0 ? hints.length - 1 : activeHint - 1
				});
			}
		} else if(code === 'Enter') {
			e.preventDefault();
			if(!match || !match?.at(3)) {
				field?.hintSelected(hints[activeHint]);
				this.setState({
					activeHint : 0
				});
			}
		}
	},

	render : function() {
		const { activeHint } = this.state;
		const { hints, field } = this.props;
		if(!field) return null;
		const bounds = field.fieldRef[field.state.id].current?.getBoundingClientRect();

		const hintElements = hints
			.filter((h)=>h.hint !== field.state.value)
			.map((h, i)=>{
				let className = 'CodeMirror-hint';
				if(activeHint === i) {
					className += ' CodeMirror-hint-active';
					return <li key={i}
						className={className}
						onMouseDown={(e)=>field.hintSelected(h, e)}
						ref={this.activeHintRef}>
						{h.hint}
					</li>;
				}
				return <li key={i}
					className={className}
					onMouseDown={(e)=>field.hintSelected(h, e)}>
					{h.hint}
				</li>;
			});

		let style = {
			display : 'none'
		};
		if(hintElements.length > 1) {
			style = {
				...style,
				display : 'block',
				top     : `${bounds.top - 5}px`,
				left    : `${bounds.left}px`
			};
		}
		return <React.Fragment>
			<ul role={'listbox'}
				id={'hints'}
				aria-expanded={true}
				className={'CodeMirror-hints default'}
				style={style}
				onKeyDown={this.keyDown}
				ref={this.hintsRef}>
				{hintElements}
			</ul>
		</React.Fragment>;
	}
});

module.exports = Hints;