const React = require('react');
const { useState } = React;
const _     = require('lodash');

const TagInput = ({unique = true, values = [], ...props})=>{

	const [temporaryValue, setTemporaryValue] = useState('');
	const [valueContext, setValueContext] = useState(values.map((value)=>({ value: value, editing : false })));


	const editTag = (evt)=>{
		setValueContext(valueContext.map((context)=>{
			context.editing = context.value === evt.target.dataset.value ? true : false;
			return context;
		}))
	}

	const renderReadTag = (value)=>{
		return (
			<div key={value} 
				data-value={value}
				className={`tag`}
				onClick={(evt)=>editTag(evt)}>
					{value}
			</div>
		)
	}

	const renderWriteTag = (value)=>{
		return (
			<input type='text' value={value} />
		)
	}

	return (
		<div className='field'>

			<label>{props.label}</label>
			<div className='list'>

				{Object.values(valueContext).map((context, i)=>{ return context.editing ? renderWriteTag(context.value) : renderReadTag(context.value) })}

				<input type='text'
					className={`value`}
					placeholder={props.placeholder}
					value={temporaryValue}
					onChange={(e)=>setTemporaryValue(e.target.value)} />
			</div>
		</div>
	)
}

module.exports = TagInput;