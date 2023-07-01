const dedent = require('dedent-tabs').default;

const loginUrl = 'https://www.naturalcrit.com/login';

const errorIndex = (props)=>{
	return {
		// Default catch all
		'00' : dedent`
			## An unknown error occurred!
			
			We aren't sure what happened, but our server wasn't able to find what you
			were looking for.`,
		// User is not Authors list
		'03' : dedent`
		## Current signed-in user does not have editor access to this brew.

		If you believe you should have access to this brew, ask one of its authors to invite you
		as an author by opening the Edit page for the brew, viewing the {{fa,fa-info-circle}}
		**Properties** tab, and adding your username to the "invited authors" list. You can
		then try to access this document again.
		
		**Brew Title:** ${props.brew.brewTitle || 'Unable to show title'}

		**Current Authors:** ${props.brew.authors?.map((author)=>{return `${author}`;}).join(', ') || 'Unable to list authors'}`,

		// User is not signed in; must be a user on the Authors List
		'04' : dedent`
		## Sign-in required to edit this brew.
		
		You must be logged in to one of the accounts listed as an author of this brew.
		User is not logged in. Please log in [here](${loginUrl}).
		
		**Brew Title:** ${props.brew.brewTitle || 'Unable to show title'}

		**Current Authors:** ${props.brew.authors?.map((author)=>{return `${author}`;}).join(', ') || 'Unable to list authors'}`,

		// Brew load error
		'05' : dedent`
		## No Homebrewery document could be found.
		
		The server could not locate the Homebrewery document. It was likely deleted by
		its owner.
		
		**Requested access:** ${props.brew.accessType}

		**Brew ID:**  ${props.brew.brewId}`,

		// Brew save error
		'06' : dedent`
		## Unable to save Homebrewery document.
		
		An error occurred wil attempting to save the Homebrewery document.`,

		// Brew delete error
		'07' : dedent`
		## Unable to delete Homebrewery document.
		
		An error occurred while attempting to remove the Homebrewery document.
		
		**Brew ID:**  ${props.brew.brewId}`,

		// Author delete error
		'08' : dedent`
		## Unable to remove user from Homebrewery document.
		
		An error occurred while attempting to remove the user from the Homebrewery document author list!
		
		**Brew ID:**  ${props.brew.brewId}`,
	};
};

module.exports = errorIndex;