const dedent = require('dedent-tabs').default;

const loginUrl = 'https://www.naturalcrit.com/login';



const errorIndex = (props)=>{
	return {
		// Default catch all
		'00' : dedent`${'unknownError'.translate()}`,

		// General Google load error
		'01' : dedent`${'googleError'.translate()}`,

		// Google Drive - 404 : brew deleted or access denied
		'02' : dedent`${'gd404'.translate()}
			${props.brew.authors?.length > 0
		? `${'gd4042'.translate()} **${props.brew.authors[0]}**,
				${props.brew.account
		? `${'gd4043'.translate()}
						${props.brew.authors[0] == props.brew.account
		? `${'gd4044'.translate()}`
		: `${'gd4045'.translate()} **${props.brew.account}**).`
}`
		: 'gd4046'.translate()
}`
		: ''
}
		${'gd404longText'.translate()}`,

		// User is not Authors list
		'03' : dedent`
		
		
		**${'Brew Title'.translate()}:** ${props.brew.brewTitle || 'unableTitle'.translate()}

		**${'Current Authors'.translate()}:** ${props.brew.authors?.map((author)=>{return `${author}`;}).join(', ') || 'unableAuthors'.translate()}
		
		[${'clickRedirect'.translate()}](/share/${props.brew.shareId})`,

		// User is not signed in; must be a user on the Authors List
		'04' : dedent`${'notSignedIn'.translate()}(${loginUrl}).
		
		**${'Brew Title'.translate()}:** ${props.brew.brewTitle || 'unableTitle'.translate()}

		**${'Current Authors'.translate()}:** ${props.brew.authors?.map((author)=>{return `${author}`;}).join(', ') || 'unableAuthors'.translate()}`,

		// Brew load error
		'05' : dedent`${'brewLoadError'}
		
		**${'Requested access'.translate()}:** ${props.brew.accessType}

		**${'Brew ID'.translate()}:**  ${props.brew.brewId}`,

		// Brew save error
		'06' : dedent`${'brewSaveError'.translate()}`,

		// Brew delete error
		'07' : dedent`${'brewDeleteError'.translate()}
		
		**${'Brew ID'.translate()}:**  ${props.brew.brewId}`,

		// Author delete error
		'08' : dedent`${'authorDeleteError'.translate()}
		
		**${'Brew ID'.translate()}:**  ${props.brew.brewId}`,
	};
};

module.exports = errorIndex;