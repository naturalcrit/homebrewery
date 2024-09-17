const React = require('react');
const { useState, useRef, useEffect } = React;
const _     = require('lodash');

const TagInput = ({unique, ...props})=>{

	const [temporaryValue, setTemporaryValue] = useState('');

	return (
		<div className='field tag-input'>
			<label>{props.label}
				<input type='text'
					className={`value`}
					placeholder={props.placeholder}
					value={temporaryValue} />
			</label>
		</div>
	)
}

module.exports = TagInput;