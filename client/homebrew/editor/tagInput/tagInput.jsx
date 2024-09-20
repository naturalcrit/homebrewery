require('./tagInput.less');
const React = require('react');
const { useState, useEffect } = React;
const _     = require('lodash');

const TagInput = ({ unique = true, values = [], ...props }) => {
	const [temporaryValue, setTemporaryValue] = useState('');
	const [valueContext, setValueContext] = useState(values.map((value) => ({ value, editing: false })));
	const [focusedIndex, setFocusedIndex] = useState(-1);

	useEffect(()=>{
		handleChange(valueContext.map((context)=>context.value))
	}, [valueContext])

	const handleChange = (value)=>{
		props.onChange({
			target : { value }
		})
	};

	const handleInputKeyDown = ({ evt, value, index = valueContext.length, options = {} }) => {
		if (_.includes(['Enter', ','], evt.key) && valueContext[index].editing == true) {
			evt.preventDefault();
			submitTag(evt.target.value, value, index);
			if (options.clear) {
				setTemporaryValue('');
			}
		} else if(evt.key === 'Escape'){
			submitTag(value, value, index)
		} else if(evt.key === 'Delete') {
			submitTag(null, null, index);
		} else if(evt.key === 'Tab' && evt.shiftKey){
			setFocus(index - 1);
		} else if(evt.key === 'Tab'){
			setFocus(index + 1);
		}
	};

	const setFocus = (index)=>{
		if (index < 0 || index >= valueContext.length){ setFocusedIndex(-1); return};
		setFocusedIndex(index);
	}

	const submitTag = (newValue, originalValue, index) => {
		setValueContext((prevContext) => {
			// remove existing tag
			if(newValue === null){
				return [...prevContext].filter((context, i)=>i !== index);
			}
			// add new tag
			if(originalValue === null){
				return [...prevContext, { value: newValue, editing: false }]
			}
			// update existing tag
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
			<li key={index}
				data-value={context.value}
				className={`tag${focusedIndex === index ? ' focused' : ''}`}
				tabIndex={focusedIndex === index ? 0 : -1}
				onClick={() => editTag(index)}
				onKeyDown={(evt)=>handleInputKeyDown({evt, index: index})}>
				{context.value}
				<button tabIndex={-1} onClick={(evt)=>{evt.stopPropagation(); submitTag(null, context.value, index)}}><i className='fa fa-times fa-fw'/></button>
			</li>
		);
	};

	const renderWriteTag = (context, index) => {
		return (
			<input type='text'
				key={index}
				defaultValue={context.value} 
				onKeyDown={(evt) => handleInputKeyDown({evt, value: context.value, index: index})} 
				autoFocus 
			/>
		);
	};

	return (
		<div className='field'>
			<label>{props.label}</label>
			<div className='value'>
				<ul className='list'>
					{valueContext.map((context, index) => { return context.editing ? renderWriteTag(context, index) : renderReadTag(context, index); })}
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
