require('./errorPage.less');
const React      = require('react');
const UIPage     = require('../basePages/uiPage/uiPage.jsx');
import Markdown  from '../../../../shared/naturalcrit/markdown.js';
const ErrorIndex = require('./errors/errorIndex.js');

const ErrorPage = ({ brew })=>{

	const brewData = brew;

	// Retrieving the error text based on the brew's error code from ErrorIndex
	const errorText = ErrorIndex({ brew })[brew.HBErrorCode.toString()] || '';

	brewData.status = brewData.status || brewData.code || 500;
	brewData.text = brewData.errors?.map((error)=>{return error.message;}).join('\n\n') || brewData.message || 'Unknown error!';

	return (
		<UIPage brew={{ title: 'Crit Fail!' }}>
			<div className='dataGroup'>
				<div className='errorTitle'>
					<h1>{`Error ${brewData?.status || '000'}`}</h1>
					<h4>{brewData?.text || 'No error text'}</h4>
				</div>
				<hr />
				<div dangerouslySetInnerHTML={{ __html: Markdown.render(errorText) }} />
			</div>
		</UIPage>
	);
};

module.exports = ErrorPage;
