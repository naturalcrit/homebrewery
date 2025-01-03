require('./errorBar.less');
const React = require('react');
const _ = require('lodash');

import Dialog from '../../../components/dialog.jsx';


const DISMISS_BUTTON = <i className='fas fa-times dismiss' />;

const ErrorBar = (props)=>{
	let hasOpenError = false, hasCloseError = false, hasMatchError = false;

	const renderErrors = ()=>(
		<ul>
			{_.map(props.errors, (err, idx)=>{
				if(err.id === 'OPEN') hasOpenError = true;
				if(err.id === 'CLOSE') hasCloseError = true;
				if(err.id === 'MISMATCH') hasMatchError = true;
				return (
					<li key={idx}>
                        Line {err.line} : {err.text}, '{err.type}' tag
					</li>
				);
			})}
		</ul>
	);

	const renderProtip = ()=>(
		<div className='protips'>
			<h4>Protips!</h4>
			{hasOpenError && <div>Unmatched opening tag. Close your tags, like this {'</div>'}. Match types!</div>}
			{hasCloseError && <div>Unmatched closing tag. Either remove it or check where it was opened.</div>}
			{hasMatchError && <div>Type mismatch. Closed a tag with a different type.</div>}
		</div>
	);

	if(!props.errors.length) return null;


	return (
		<Dialog className='errorBar' closeText={DISMISS_BUTTON} >
			<div>
				<i className='fas fa-exclamation-triangle' />
				<h2> There are HTML errors in your markup</h2>
            	<small>
                	If these aren't fixed your brew will not render properly when you print it to PDF or share it
            	</small>
            	{renderErrors()}
			</div>
			<hr />
			{renderProtip()}
		</Dialog>
	);
};

module.exports = ErrorBar;
