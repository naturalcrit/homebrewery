require('./errorPage.less');
const React      = require('react');
const UIPage     = require('../basePages/uiPage/uiPage.jsx');
import Markdown  from '../../../../shared/markdown.js';
const ErrorIndex = require('./errors/errorIndex.js');

const ErrorPage = ({ brew })=>{
	// Retrieving the error text based on the brew's error code from ErrorIndex
	const errorText = ErrorIndex({ brew })[brew.HBErrorCode.toString()] || '';

	return (
		<UIPage brew={{ title: 'Crit Fail!' }}>
			<div className='dataGroup'>
				<div className='errorTitle'>
					<h1>{`Error ${brew?.status || '000'}`}</h1>
					<h4>{brew?.text || 'No error text'}</h4>
				</div>
				<hr />
				<div dangerouslySetInnerHTML={{ __html: Markdown.render(errorText) }} />
			</div>
		</UIPage>
	);
};

module.exports = ErrorPage;
