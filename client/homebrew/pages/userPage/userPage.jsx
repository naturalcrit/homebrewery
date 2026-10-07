import React, { useState } from 'react';
import _ from 'lodash';

import ListPage from '../basePages/listPage/listPage.jsx';

const UserPage = (props)=>{
	props = {
		username : '',
		brews    : [],
		query    : '',
		...props
	};

	const [error, setError] = useState(null);

	const usernameWithS = props.username + (props.username.endsWith('s') ? `’` : `’s`);
	const groupedBrews = _.groupBy(props.brews, (brew)=>brew.published ? 'published' : 'private');

	const brewCollection = [
		{
			title : `${usernameWithS} published brews`,
			class : 'published',
			brews : groupedBrews.published || []
		},
		...(props.username === global.account?.username ? [{
			title : `${usernameWithS} unpublished brews`,
			class : 'unpublished',
			brews : groupedBrews.private || []
		}] : [])
	];

	const clearError = ()=>{
		setError(null);
	};

	return (
		<ListPage brewCollection={brewCollection} query={props.query} reportError={(err)=>setError(err)} />
	);
};

export default UserPage;
