const dedent = require('dedent-tabs').default;

const loginUrl = 'https://www.naturalcrit.com/login';

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
			## We can't find this brew in your Google Drive!
			
			This error tells us your file was saved on your Google Drive, but the link
			you tried to open doesn't work anymore. The Homebrewery cannot delete files
			from your Google Drive on its own, so there are three most likely possibilities:
			:
			- **You may have accidentally deleted the Google Drive files.** Look on 
			${props.brew.authors?.length > 0 ? `the Google Drive account associated with the **${props.brew.authors[0]}** Homebrewery account` : 'your Google Drive account'}
			and make sure the Homebrewery folder is still there, and that it holds your brews
			as text files.
			- **You may have changed the sharing settings for your files.** If the files
			are still on Google Drive, change all of them to be shared *with everyone who has
			the link* so the Homebrewery can access them.
			- **Your Google Account may be full**, or may be have been closed by
			Google (for inactivity, violating some policy of theirs). Make sure you can still
			access your Google Drive normally and upload/download files to it.
			:
			If you can't find it, Google Drive usually puts your file in your Trash folder for
			30 days. Assuming you didn't empty the trash right after, it might be worth checking.
			You can also look on the right side of the page while logged into Google Drive and
			look at the Activity tab. This can help you pin down the exact date the brew was
			deleted and by whom.
			:
			If you *still* can't find it, some people have had success asking Google to recover
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
		## The current logged in user does not have editor access to this brew.

		If you believe you should have access to this brew, ask the file owner to invite you
		as an author by opening the brew, viewing the Properties tab, and adding your username
		to the "invited authors" list. You can then try to access this document again.
		
		**Brew Title:** ${props.brew.brewTitle || 'Unable to show title'}

		**Current Authors:**

		${props.brew.authors?.map((author)=>{return `- ${author}`;}).join('\n') || 'Unable to list authors'}
		`,

		// User is not logged in
		'04' : dedent`
		## Not logged in
		
		User is not logged in. Please log in [here](${loginUrl}).`,

		// Brew load error
		'05' : dedent`
		## No Homebrewery document could be found.
		
		The server could not locate the Homebrewery document.
		
		**Requested access:** ${props.brew.accessType}

		**Brew ID:**  ${props.brew.brewId}
		`,

		// Brew save error
		'06' : dedent`
		## Unable to save Homebrewery document.
		
		An error occurred wil attempting to save the Homebrewery document.`,

		// Brew delete error
		'07' : dedent`
		## Unable to delete Homebrewery document.
		
		An error occurred while attempting to remove the Homebrewery document.
		
		**Brew ID:**  ${props.brew.brewId}
		`,

		// Author delete error
		'08' : dedent`
		## Unable to remove user from Homebrewery document.
		
		An error occurred while attempting to remove the user from the Homebrewery document author list!
		
		**Brew ID:**  ${props.brew.brewId}
		`,
	};
};

module.exports = errorIndex;