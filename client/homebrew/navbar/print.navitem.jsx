import React, { useState, useEffect } from 'react';
import Nav from './nav.jsx';
import { printCurrentBrew } from '@shared/helpers.js';

export default function(){
	const [printing, setPrinting] = useState(false);

	// listen for print cycle events to display "loading" message since it can take some time.
	useEffect(()=>{
		document.addEventListener('print:startprep', handlePrintStartPrep);
		document.addEventListener('print:finishedprep', handlePrintPrepFinished);
		return ()=>{
			document.removeEventListener('print:startprep', handlePrintStartPrep);
			document.removeEventListener('print:finishedprep', handlePrintPrepFinished);
		}
	}, []);

	const handlePrintStartPrep = ()=>{ setPrinting(true); };

	const handlePrintPrepFinished = ()=>{ setPrinting(false);	};

	return <Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
		{printing ? 'loading' : 'get PDF'}
	</Nav.item>;
};
