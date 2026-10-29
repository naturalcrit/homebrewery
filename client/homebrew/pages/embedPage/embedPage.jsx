import './embedPage.less';
import React, { useState } from 'react';

import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';
import {  fetchThemeBundle } from '@shared/helpers.js';

const EmbedPage = (props)=>{
	const [themeBundle, setThemeBundle]  = useState({});
	fetchThemeBundle(undefined, setThemeBundle, props.brew.renderer, props.brew.theme);
	return 	(
		<BrewRenderer
			text={props.brew.text}
			style={props.brew.style}
			lang={props.brew.lang}
			renderer={props.brew.renderer}
			theme={props.brew.theme}
			themeBundle={themeBundle}
			allowPrint={true}
			embedPage={true}
		/>
	);
};

export default EmbedPage;
