const React = require('react');
const { useState } = React;
const _     = require('lodash');

const TagInput = ({unique = true, values = [], ...props})=>{

	const [temporaryValue, setTemporaryValue] = useState('');
	const [valueContext, setValueContext] = useState(values.map((value)=>({ value: value, editing : false })));

	const readTag = (value)=>{
		return (
			<div className={`tag`}>{value}</div>
		)
	}

	const writeTag = (value)=>{
		return (
			<input type='text' value={value} />
		)
	}

	return (
		<div className='field'>

			<label>{props.label}</label>
			<div className='list'>

				{Object.values(valueContext).map((context, i)=>{ return context.editing ? writeTag(context.value) : readTag(context.value) })}

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