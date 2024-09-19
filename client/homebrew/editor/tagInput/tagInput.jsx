const React = require('react');
const { useState } = React;

const TagInput = ({ unique = true, values = [], ...props }) => {
	const [temporaryValue, setTemporaryValue] = useState('');
	const [valueContext, setValueContext] = useState(values.map((value) => ({ value, editing: false })));

	const handleInputKeyDown = (evt, value) => {
		if (evt.key === 'Enter') {
			submitTag(evt.target.value, value);
		}
	};

	const submitTag = (newValue, originalValue) => {
		setValueContext((prevContext) => {
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

	const renderReadTag = (context) => {
		return (
			<div key={context.value}
				data-value={context.value}
				className='tag'
				onClick={() => editTag(context.value)}>
				{context.value}
			</div>
		);
	};

	const renderWriteTag = (context) => {
		return (
			<input type='text'
				key={context.value}
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
				{valueContext.map((context) => { return context.editing ? renderWriteTag(context) : renderReadTag(context); })}

				<input type='text'
					className='value'
					placeholder={props.placeholder}
					value={temporaryValue}
					onChange={(e) => setTemporaryValue(e.target.value)} />
			</div>
		</div>
	);
};

module.exports = TagInput;
