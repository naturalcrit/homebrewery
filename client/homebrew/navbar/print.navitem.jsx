import React, { useState, useEffect } from 'react';
import Nav from './nav.jsx';
import { printCurrentBrew } from '@shared/helpers.js';

export default function({ disabled }){
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

	return <Nav.item onClick={printCurrentBrew} icon='far fa-file-pdf' disabled={disabled}>
		{printing ? 'loading' : 'get PDF'}
	</Nav.item>;
};
