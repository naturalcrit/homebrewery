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

	const handleInputKeyDown = (evt, value) => {
		if (evt.key === 'Enter') {
			submitTag(evt.target.value, value);
		}
	};

	

	const submitTag = (newValue, originalValue) => {
		setValueContext((prevContext) => {
			// remove existing tag
			if(newValue === null){
				console.log('remove');
				return [...prevContext].filter((context)=>context.value !== originalValue);
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
			<div key={index}
				data-value={context.value}
				className='tag'
				onClick={() => editTag(context.value)}>
				{context.value}
				<button onClick={(evt)=>{evt.stopPropagation(); submitTag(null, context.value)}}><i className='fa fa-times fa-fw'/></button>
			</div>
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
			<div className='list'>
				{valueContext.map((context, index) => { return context.editing ? renderWriteTag(context, index) : renderReadTag(context, index); })}

				<input type='text'
					className='value'
					placeholder={props.placeholder}
					value={temporaryValue}
					onChange={(e) => setTemporaryValue(e.target.value)}
					onKeyDown={(evt) => handleInputKeyDown(evt, null)}  />
			</div>
		</div>
	);
};

module.exports = TagInput;
