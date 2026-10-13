import React, { useState, useEffect } from 'react';
import Nav from './nav.jsx';
import { printCurrentBrew } from '@shared/helpers.js';

const processShareId = (brew)=>{

	return brew.googleId && !brew.stubbed ? brew.googleId + brew.shareId : brew.shareId;
};

export default ({ currentBrew })=>{
	const [printing, setPrinting] = useState(false);

	// listen for print cycle events to display "loading" message since it can take some time.
	useEffect(()=>{
		document.addEventListener('print:startprep', handlePrintStartPrep);
		document.addEventListener('print:finishedprep', handlePrintPrepFinished);
		return ()=>{
			document.removeEventListener('print:startprep', handlePrintStartPrep);
			document.removeEventListener('print:finishedprep', handlePrintPrepFinished);
		};
	}, []);

	const handlePrintStartPrep = ()=>{ setPrinting(true); };

	const handlePrintPrepFinished = ()=>{ setPrinting(false);	};

	if(currentBrew?.shareId) return <Nav.dropdown>
		<Nav.item color='purple' icon='fas fa-code'>
			export
		</Nav.item>
		<Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
			{printing ? 'loading' : 'get PDF'}
		</Nav.item>
		<Nav.item color='blue' icon='fas fa-download' href={`/download/cm/${processShareId(currentBrew)}`}>
			Markdown
		</Nav.item>
		<Nav.item color='blue' icon='fas fa-download' href={`/download/toml/${processShareId(currentBrew)}`}>
			Markdown (TOML)
		</Nav.item>
		<Nav.item color='blue' icon='fas fa-download' href={`/download/json/${processShareId(currentBrew)}`}>
			Markdown (JSON)
		</Nav.item>
		<Nav.item color='blue' icon='fas fa-download' href={`/download/hb/${processShareId(currentBrew)}`}>
			Markdown (Homebrewery)
		</Nav.item>
	</Nav.dropdown>;
	else return <Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
		{printing ? 'loading' : 'get PDF'}
	</Nav.item>;
};
