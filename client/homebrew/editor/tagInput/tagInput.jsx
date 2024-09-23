require('./tagInput.less');
const React = require('react');
const { useState, useEffect, useRef } = React;
const _ = require('lodash');

const TagInput = ({ unique = true, values = [], ...props }) => {
	const [temporaryValue, setTemporaryValue] = useState('');
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const [valueContext, setValueContext] = useState(values.map((value) => ({ value, editing: false })));
	const tagRefs = useRef([]);

	useEffect(() => {
		handleChange(valueContext.map((context) => context.value));
		tagRefs.current = tagRefs.current.slice(0, valueContext.length);
	}, [valueContext]);

	useEffect(() => {
		if (focusedIndex >= 0 && focusedIndex < tagRefs.current.length) {
			tagRefs.current[focusedIndex]?.focus();
		}
	}, [valueContext, focusedIndex]);

	const handleChange = (value) => {
		props.onChange({
			target: { value }
		});
	};

	const handleInputKeyDown = ({ evt, value, index = valueContext.length, options = {} }) => {
		if (_.includes(['Enter', ','], evt.key)) {
			if (!valueContext[index]) {
				submitTag(evt.target.value, null, null, evt);
			} else if (valueContext[index].editing === true) {
				submitTag(evt.target.value, value, index, evt);
			} else if (evt.key === 'Enter' && valueContext[index].editing === false) {
				editTag(index);
			}
			if (options.clear) {
				setTemporaryValue('');
			}
		} else if (evt.key === ' ' && valueContext[index].editing === false) {
			evt.preventDefault();
			editTag(index);
		} else if (evt.key === 'Escape') {
			submitTag(value, value, index, evt);
		} else if (evt.key === 'Delete') {
			submitTag(null, null, index, evt);
		} else if ((evt.key === 'Tab' && evt.shiftKey) || evt.key === 'ArrowLeft') {
			setFocus(index - 1, evt);
		} else if (evt.key === 'Tab' || evt.key === 'ArrowRight') {
			setFocus(index + 1, evt);
		}
	};

	const setFocus = (index, evt) => {
		if (index < 0 || index >= valueContext.length) {
			setFocusedIndex(-1);
			evt.target.blur();
			return;
		}
		evt.preventDefault();
		setFocusedIndex(index);
	};

	const submitTag = (newValue, originalValue, index, evt) => {
		evt.preventDefault();
		setValueContext((prevContext) => {
			// Remove tag
			if (newValue === null) {
				return [...prevContext].filter((context, i) => i !== index);
			}
			// Add tag
			if (originalValue === null) {
				return [...prevContext, { value: newValue, editing: false }];
			}
			// Update tag
			return prevContext.map((context, i) => {
				if (i === index) {
					return { ...context, value: newValue, editing: false };
				}
				return context;
			});
		});
	};

	const editTag = (index) => {
		setValueContext((prevContext) => {
			return prevContext.map((context, i) => {
				if (i === index) {
					return { ...context, editing: true };
				}
				return { ...context, editing: false };
			});
		});
	};

	const renderReadTag = (context, index) => {
		return (
			<li
				key={index}
				ref={(el) => (tagRefs.current[index] = el)}
				data-value={context.value}
				className={`tag${focusedIndex === index ? ' focused' : ''}`}
				onClick={() => editTag(index)}
				onKeyDown={(evt) => handleInputKeyDown({ evt, index })}
				tabIndex={focusedIndex === index ? 0 : -1}
				onFocus={() => setFocusedIndex(index)}
			>
				{context.value}
				<button
					tabIndex={-1}
					onClick={(evt) => {
						evt.stopPropagation();
						submitTag(null, context.value, index, evt);
					}}
				>
					<i className='fa fa-times fa-fw' />
				</button>
			</li>
		);
	};

	const renderWriteTag = (context, index) => {
		return (
			<input
				type='text'
				ref={(el) => (tagRefs.current[index] = el)}
				key={index}
				defaultValue={context.value}
				tabIndex={focusedIndex === index ? 0 : -1}
				onKeyDown={(evt) => handleInputKeyDown({ evt, value: context.value, index })}
				autoFocus
			/>
		);
	};

	return (
		<div className='field'>
			<label>{props.label}</label>
			<div className='value'>
				<ul className='list'>
					{valueContext.map((context, index) => {
						return context.editing ? renderWriteTag(context, index) : renderReadTag(context, index);
					})}
				</ul>

				<input
					type='text'
					className='value'
					placeholder={props.placeholder}
					value={temporaryValue}
					onChange={(e) => setTemporaryValue(e.target.value)}
					onKeyDown={(evt) => handleInputKeyDown({ evt, value: null, options: { clear: true } })}
				/>
			</div>
		</div>
	);
};

module.exports = TagInput;
