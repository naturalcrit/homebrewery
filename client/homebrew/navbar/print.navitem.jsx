import React from 'react';
import Nav from './nav.jsx';
import { printCurrentBrew } from '../../../shared/helpers.js';

export default function(props){
	return <Nav.dropdown>
		<Nav.item color='grey' icon='fas fa-question-circle'>
			export
		</Nav.item>
		<Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
			get PDF
		</Nav.item>
		<Nav.item color='orange' icon='fas fa-file-code' href={`/export/slimHTML/${props?.brew?.editId || props?.brew?.shareId}`}>
			get HTML
		</Nav.item>
		<Nav.item color='orange' icon='fas fa-file-archive' href={`/export/zipHTML/${props?.brew?.editId || props?.brew?.shareId}`}>
			get HTML (Zip)
		</Nav.item>
	</Nav.dropdown>;
};
