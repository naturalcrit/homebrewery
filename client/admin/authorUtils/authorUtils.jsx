import React from 'react';

import AuthorLookup from './authorLookup/authorLookup.jsx';

const authorUtils = ()=>{
	return (
		<section className='authorUtils'>
			<AuthorLookup />
		</section>
	);
};

module.exports = authorUtils;