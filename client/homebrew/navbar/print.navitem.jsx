import React from 'react';
import Nav from './nav.jsx';
import { printCurrentBrew, scrapeBrewHTML, scrapeBrewZip } from '../../../shared/helpers.js';

export default function(props){
	return <Nav.dropdown>
		<Nav.item color='grey' icon='fas fa-question-circle'>
			export
		</Nav.item>
		<Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
			get PDF
		</Nav.item>
		<Nav.item onClick={scrapeBrewHTML} color='orange' icon='fas fa-file-code'>
			get HTML
		</Nav.item>
		<Nav.item onClick={scrapeBrewZip} color='orange' icon='fas fa-file-archive'>
			get HTML (Zip)
		</Nav.item>
	</Nav.dropdown>;
};
