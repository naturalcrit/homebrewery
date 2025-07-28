require('./errorPage.less');
import React from 'react';
const UIPage     = require('../basePages/uiPage/uiPage.jsx');
import Markdown  from '../../../../shared/naturalcrit/markdown.js';
import ErrorIndex from './errors/errorIndex.js';
import DefaultErrorImage from 'client/svg/gandalf.svg';

const ErrorPage = ({ brew })=>{
	// Retrieving the error text based on the brew's error code from ErrorIndex
	const error = ErrorIndex(brew.HBErrorCode.toString(), { brew })|| '';

	return (
		<UIPage className='error-page'>
			<img src={error.image?.uri || DefaultErrorImage} />
			<h2>{error.title || 'Whoops!'}</h2>
			<div dangerouslySetInnerHTML={{ __html: Markdown.render(error.text || 'This is the error message for the error message.') }} />
			<p id='hb-error-code'>HB_Error_Code: {brew.HBErrorCode.toString()}</p>
			<p id='attribution'>{error.image?.attribution ? `Image Attribution: ${error.image.attribution}` : ''}</p>
		</UIPage>
	);
};

module.exports = ErrorPage;
