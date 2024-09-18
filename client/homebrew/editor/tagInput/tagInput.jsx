const React = require('react');
const { useState } = React;
const _     = require('lodash');

const TagInput = ({unique = true, values = [], ...props})=>{

	const [temporaryValue, setTemporaryValue] = useState('');
	const [valueContext, setValueContext] = useState(values.map((value)=>({ value: value, editing : false })));

	const tagElement = (value)=>{
		return (
			<div className={`badge`}>{value}</div>
		)
	}

	return (
		<div className='field'>

			<label>{props.label}</label>
			{Object.values(valueContext).map((context, i)=>{ return context.editing ? tagElement('editing') : tagElement(context.value) })}

			<input type='text'
				className={`value`}
				placeholder={props.placeholder}
				value={temporaryValue}
				onChange={(e)=>setTemporaryValue(e.target.value)} />
		</div>
	)
}

module.exports = TagInput;