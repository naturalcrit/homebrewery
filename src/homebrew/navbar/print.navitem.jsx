import React from 'react';
import Nav from './nav.jsx';
import { printCurrentBrew } from '../../../shared/helpers.js';

export default function(){
	return <Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
		get PDF
	</Nav.item>;
};
