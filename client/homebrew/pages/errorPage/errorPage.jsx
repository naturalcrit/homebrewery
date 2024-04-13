import './errorPage.less';
import React from 'react';
import UIPage from '../basePages/uiPage/uiPage.jsx';
import Markdown from '../../../../shared/naturalcrit/markdown.js';
import ErrorIndex from './errors/errorIndex.js';

const ErrorPage = ({ brew })=>{
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
