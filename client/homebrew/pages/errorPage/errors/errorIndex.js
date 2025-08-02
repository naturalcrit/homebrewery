/* eslint-disable max-lines */
import dedent from 'dedent-tabs';

const loginUrl = 'https://www.naturalcrit.com/login';

const errorIndex = (props)=>{
	return {
		'00' : {
			title : 'An unknown error occurred!',
			text  : 'We aren\'t sure what happened, but our server wasn\'t able to find what you were looking for.',
			image : { uri: null, attribution: null }
		},
		'01' : {
			title : 'An error occurred while retrieving this brew from Google Drive!',
			text  : dedent`
						Google is able to see the brew at this link, but reported an error while attempting to retrieve it.

						### Refreshing your Google Credentials

						This issue is likely caused by an issue with your Google credentials; if you are the owner of this file, the following steps may resolve the issue:

						- Go to https://www.naturalcrit.com/login and click logout if present (in small text at the bottom of the page).
						- Click "Sign In with Google", which will refresh your Google credentials.
						- After completing the sign in process, return to Homebrewery and refresh/reload the page so that it can pick up the updated credentials.
						- If this was the source of the issue, it should now be resolved.

						If following these steps does not resolve the issue, please let us know!`,
			image : { uri: null, attribution: null }
		},
		'02' : {
			title : 'We can\'t find this brew in Google Drive!',
			text  : dedent`                
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
			image : { uri: null, attribution: null }
		},
		'03' : {
			title : 'Current signed-in user does not have editor access to this brew.',
			text  : dedent`
					If you believe you should have access to this brew, ask one of its authors to invite you
					as an author by opening the Edit page for the brew, viewing the {{fa,fa-info-circle}}
					**Properties** tab, and adding your username to the "invited authors" list. You can
					then try to access this document again.
					
					:

					**Brew Title:** ${escape(props.brew.brewTitle) || 'Unable to show title'}

					**Current Authors:** ${props.brew.authors?.map((author)=>{return `[${author}](/user/${author})`;}).join(', ') || 'Unable to list authors'}
					
					[Click here to be redirected to the brew's share page.](/share/${props.brew.shareId})
				`,
			image : { uri: null, attribution: null }
		},
		'04' : {
			title : 'Sign-in required to edit this brew.',
			text  : dedent`         
					You must be logged in to one of the accounts listed as an author of this brew.
					User is not logged in. Please log in [here](${loginUrl}).
					
					:

					**Brew Title:** ${escape(props.brew.brewTitle) || 'Unable to show title'}

					**Current Authors:** ${props.brew.authors?.map((author)=>{return `[${author}](/user/${author})`;}).join(', ') || 'Unable to list authors'}

					[Click here to be redirected to the brew's share page.](/share/${props.brew.shareId})
				`,
			image : { uri: null, attribution: null }
		},
		'05' : {
			title : 'No Homebrewery document could be found.',
			text  : dedent`            
					The server could not locate the Homebrewery document. The link may either be wrong, or it was likely deleted by
					its owner.  
					
					Use the [Vault](/vault) to continue your search for brews.

					**Requested access:** ${props.brew.accessType}

					**Brew ID:**  ${props.brew.brewId}
				`,
			image : { uri: null, attribution: null }
		},
		'06' : {
			title : 'Unable to save Homebrewery document.',
			text  : 'An error occurred while attempting to save the Homebrewery document.',
			image : { uri: null, attribution: null }
		},
		'07' : {
			title : 'Unable to delete Homebrewery document.',
			text  : dedent`            
					An error occurred while attempting to remove the Homebrewery document.
					
					:

					**Brew ID:**  ${props.brew.brewId}`,
			image : { uri: null, attribution: null }
		},
		'08' : {
			title : 'Unable to remove user from Homebrewery document.',
			text  : dedent`
					An error occurred while attempting to remove the user from the Homebrewery document author list!
					
					:

					**Brew ID:**  ${props.brew.brewId}`,
			image : { uri: null, attribution: null }
		},
		'09' : {
			title : 'No Homebrewery theme document could be found.',
			text  : dedent`
					The server could not locate the Homebrewery document. It was likely deleted by
					its owner.
					
					:

					**Requested access:** ${props.brew.accessType}

					**Brew ID:**  ${props.brew.brewId}`,
			image : { uri: null, attribution: null }
		},
		'10' : {
			title : 'The selected theme is not tagged as a theme.',
			text  : dedent`
					The brew selected as a theme exists, but has not been marked for use as a theme with the \`theme:meta\` tag.
					
					If the selected brew is your document, you may designate it as a theme by adding the \`theme:meta\` tag.`,
			image : { uri: null, attribution: null }
		},
		'11' : {
			title : 'No Homebrewery document could be found.',
			text  : dedent`
					
					The server could not locate the Homebrewery document. The Brew ID failed the validation check.
					
					:

					**Brew ID:**  ${props.brew.brewId}
				`,
			image : { uri: null, attribution: null }
		},
		'12' : {
			title : 'No Google document could be found.',
			text  : dedent`
					The server could not locate the Google document. The Google ID failed the validation check.
					
					:

					**Brew ID:**  ${props.brew.brewId}`,
			image : { uri: null, attribution: null }
		},
		'50' : {
			title : 'You are not signed in',
			text  : dedent`
					You are trying to access the account page, but are not signed in to an account.
					
					Please login or signup at our [login page](https://www.naturalcrit.com/login?redirect=https://homebrewery.naturalcrit.com/account).`,
			image : { uri: null, attribution: null }
		},
		'51' : {
			title : 'This brew has been locked.',
			text  : dedent`
					Only an author may request that this lock is removed.
					
					:

					**Brew ID:**  ${props.brew.brewId}
					
					**Brew Title:** ${escape(props.brew.brewTitle)}
					
					**Brew Authors:**  ${props.brew.authors?.map((author)=>{return `[${author}](/user/${author})`;}).join(', ') || 'Unable to list authors'}`,
			image : { uri: null, attribution: null }
		},
		'52' : {
			title : 'Access Denied',
			text  : 'You need to provide correct administrator credentials to access this page.',
			image : { uri: null, attribution: null }
		},
		'60' : {
			title : 'Lock Error',
			text  : 'An issue occurred with the lock.',
			image : { uri: null, attribution: null }
		},
		'61' : {
			title : 'Lock Get Error',
			text  : 'Unable to get lock count.',
			image : { uri: null, attribution: null }
		},
		'62' : {
			title : 'Lock Set Error',
			text  : 'Cannot set lock.',
			image : { uri: null, attribution: null }
		},
		'63' : {
			title : 'Lock Set Error',
			text  : 'Brew not found.',
			image : { uri: null, attribution: null }
		},
		'64' : {
			title : 'Lock Set Error',
			text  : 'Already locked.',
			image : { uri: null, attribution: null }
		},
		'65' : {
			title : 'Lock Remove Error',
			text  : 'Cannot unlock.',
			image : { uri: null, attribution: null }
		},
		'66' : {
			title : 'Lock Remove Error',
			text  : 'Brew not found.',
			image : { uri: null, attribution: null }
		},
		'67' : {
			title : 'Lock Remove Error',
			text  : 'Brew not locked.',
			image : { uri: null, attribution: null }
		},
		'68' : {
			title : 'Lock Get Review Error',
			text  : 'Cannot get review requests.',
			image : { uri: null, attribution: null }
		},
		'69' : {
			title : 'Lock Set Review Error',
			text  : 'Cannot set review request.',
			image : { uri: null, attribution: null }
		},
		'70' : {
			title : 'Lock Set Review Error',
			text  : 'Brew not found.',
			image : { uri: null, attribution: null }
		},
		'71' : {
			title : 'Lock Set Review Error',
			text  : 'Review already requested.',
			image : { uri: null, attribution: null }
		},
		'72' : {
			title : 'Lock Remove Review Error',
			text  : 'Cannot clear review request.',
			image : { uri: null, attribution: null }
		},
		'73' : {
			title : 'Lock Remove Review Error',
			text  : 'Brew not found.',
			image : { uri: null, attribution: null }
		},
		'90' : {
			title : 'Whoops',
			text  : 'An unexpected error occurred while looking for these brews. Try again in a few minutes.',
			image : { uri: null, attribution: null }
		},
		'91' : {
			title : 'Cannot get total brews',
			text  : 'An unexpected error occurred while trying to get the total of brews.',
			image : { uri: null, attribution: null }
		}
	};

};

module.exports = errorIndex;