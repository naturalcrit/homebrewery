require('./tagInput.less');
const React = require('react');
const { useState, useEffect } = React;
const _     = require('lodash');

const TagInput = ({ unique = true, values = [], ...props }) => {
	const [temporaryValue, setTemporaryValue] = useState('');
	const [valueContext, setValueContext] = useState(values.map((value) => ({ value, editing: false })));

	useEffect(()=>{
		handleChange(valueContext.map((context)=>context.value))
	}, [valueContext])

	const handleChange = (value)=>{
		props.onChange({
			target : { value }
		})
	};

	const handleInputKeyDown = (evt, value, clear = false) => {
		if (evt.key === 'Enter') {
			submitTag(evt.target.value, value);
			if(clear){ setTemporaryValue(''); }
		};
	};

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
			return prevContext.map((context) => {
				if (context.value === originalValue) {
					return { ...context, value: newValue, editing: false };
				}
				return context;
			});
		});
	};

	const editTag = (valueToEdit) => {
		setValueContext((prevContext) => {
			return prevContext.map((context) => {
				if (context.value === valueToEdit) {
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
				className='tag'
				onClick={() => editTag(context.value)}>
				{context.value}
				<button onClick={(evt)=>{evt.stopPropagation(); submitTag(null, context.value, index)}}><i className='fa fa-times fa-fw'/></button>
			</li>
		);
	};

	const renderWriteTag = (context, index) => {
		return (
			<input type='text'
				key={index}
				defaultValue={context.value} 
				onKeyDown={(evt) => handleInputKeyDown(evt, context.value)} 
				autoFocus 
			/>
		);
	};

	return (
		<div className='field'>
			<label>{props.label}</label>
			<div className='tag-input'>
				<ul className='list'>
					{valueContext.map((context, index) => { return context.editing ? renderWriteTag(context, index) : renderReadTag(context, index); })}
				</ul>

				<input type='text'
					className='value'
					placeholder={props.placeholder}
					value={temporaryValue}
					onChange={(e) => setTemporaryValue(e.target.value)}
					onKeyDown={(evt) => handleInputKeyDown(evt, null, true)}  />
			</div>
		</div>
	);
};

module.exports = TagInput;
