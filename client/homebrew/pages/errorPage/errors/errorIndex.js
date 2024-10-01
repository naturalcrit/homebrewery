const dedent = require('dedent-tabs').default;

const loginUrl = 'https://www.naturalcrit.com/login';

//001-050 : Brew errors
//050-100 : Other pages errors

const errorIndex = (props)=>{
	return {
		// Default catch all
		'00' : dedent`
			## An unknown error occurred!
			
			We aren't sure what happened, but our server wasn't able to find what you
			were looking for.`,

		// General Google load error
		'01' : dedent`
			## An error occurred while retrieving this brew from Google Drive!
			
			Google reported an error while attempting to retrieve a brew from this link.`,

		// Google Drive - 404 : brew deleted or access denied
		'02' : dedent`
			## We can't find this brew in Google Drive!
			
			This file was saved on Google Drive, but this link doesn't work anymore.
			${props.brew.authors?.length > 0
		? `Note that this brew belongs to the Homebrewery account **${props.brew.authors[0]}**,
				${props.brew.account
		? `which is
						${props.brew.authors[0] == props.brew.account
		? `your account.`
		: `not your account (you are currently signed in as **${props.brew.account}**).`
}`
		: 'and you are not currently signed in to any account.'
}`
		: ''
}
			The Homebrewery cannot delete files from Google Drive on its own, so there
			are three most likely possibilities:
			:
			- **The Google Drive files may have been accidentally deleted.** Look in
			the Google Drive account that owns this brew (or ask the owner to do so),
			and make sure the Homebrewery folder is still there, and that it holds your brews
			as text files.
			- **You may have changed the sharing settings for your files.** If the files
			are still on Google Drive, change all of them to be shared *with everyone who has
			the link* so the Homebrewery can access them.
			- **The Google Account may be closed.** Google may have removed the account
			due to inactivity or violating a Google policy. Make sure the owner can
			still access Google Drive normally and upload/download files to it.
			:
			If the file isn't found, Google Drive usually puts your file in your Trash folder for
			30 days. Assuming the trash hasn't been emptied yet, it might be worth checking.
			You can also find the Activity tab on the right side of the Google Drive page, which
			shows the recent activity on Google Drive. This can help you pin down the exact date
			the brew was deleted or moved, and by whom.
			:
			If the brew still isn't found, some people have had success asking Google to recover
			accidentally deleted files at this link: 
			https://support.google.com/drive/answer/1716222?hl=en&ref_topic=7000946.
			At the bottom of the page there is a button that says *Send yourself an Email*
			and you will receive instructions on how to request the files be restored.
			:
			Also note, if you prefer not to use your Google Drive for storage, you can always
			change the storage location of a brew by clicking the Google drive icon by the
			brew title and choosing *transfer my brew to/from Google Drive*.`,

		// User is not Authors list
		'03' : dedent`
		## Current signed-in user does not have editor access to this brew.

		If you believe you should have access to this brew, ask one of its authors to invite you
		as an author by opening the Edit page for the brew, viewing the {{fa,fa-info-circle}}
		**Properties** tab, and adding your username to the "invited authors" list. You can
		then try to access this document again.
		
		:

		**Brew Title:** ${props.brew.brewTitle || 'Unable to show title'}

		**Current Authors:** ${props.brew.authors?.map((author)=>{return `[${author}](/user/${author})`;}).join(', ') || 'Unable to list authors'}
		
		[Click here to be redirected to the brew's share page.](/share/${props.brew.shareId})`,

		// User is not signed in; must be a user on the Authors List
		'04' : dedent`
		## Sign-in required to edit this brew.
		
		You must be logged in to one of the accounts listed as an author of this brew.
		User is not logged in. Please log in [here](${loginUrl}).
		
		:

		**Brew Title:** ${props.brew.brewTitle || 'Unable to show title'}

		**Current Authors:** ${props.brew.authors?.map((author)=>{return `[${author}](/user/${author})`;}).join(', ') || 'Unable to list authors'}

		[Click here to be redirected to the brew's share page.](/share/${props.brew.shareId})`,


		// Brew load error
		'05' : dedent`
		## No Homebrewery document could be found.
		
		The server could not locate the Homebrewery document. It was likely deleted by
		its owner.
		
		:

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
		
		:

		**Brew ID:**  ${props.brew.brewId}`,

		// Author delete error
		'08' : dedent`
		## Unable to remove user from Homebrewery document.
		
		An error occurred while attempting to remove the user from the Homebrewery document author list!
		
		:

		**Brew ID:**  ${props.brew.brewId}`,

		// Theme load error
		'09' : dedent`
		## No Homebrewery theme document could be found.
		
		The server could not locate the Homebrewery document. It was likely deleted by
		its owner.
		
		:

		**Requested access:** ${props.brew.accessType}

		**Brew ID:**  ${props.brew.brewId}`,

		//account page when account is not defined
		'50' : dedent`
		## You are not signed in
		
		You are trying to access the account page, but are not signed in to an account.
		
		Please login or signup at our [login page](https://www.naturalcrit.com/login?redirect=https://homebrewery.naturalcrit.com/account).`,

		// Brew locked by Administrators error
		'51' : dedent`
		## This brew has been locked.
		
		Only an author may request that this lock is removed.
		
		:

		**Brew ID:**  ${props.brew.brewId}
		
		**Brew Title:** ${props.brew.brewTitle}`,


		// ####### Admin page error ####### 

		'52': dedent`
		## Access Denied
		You need to provide correct administrator credentials to access this page.
		:
		This page is for administrators only, if you are not an administrator, stop trying to access it.`,

		'90' : dedent` An unexpected error occurred while looking for these brews.  
            Try again in a few minutes.`,

		'91' : dedent` An unexpected error occurred while trying to get the total of brews.`,
	};
};

module.exports = errorIndex;
