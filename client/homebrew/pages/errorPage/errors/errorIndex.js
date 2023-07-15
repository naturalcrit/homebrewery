const dedent = require('dedent-tabs').default;

const loginUrl = 'https://www.naturalcrit.com/login';

const errorIndex = (props)=>{
	return {
		// Default catch all
		'00' : dedent`
			## Unbekannter Fehler!
			
			Es ist unklar, was passiert ist, aber der server konnte nicht finden, was du suchst.`,

		// General Google load error
		'01' : dedent`
			## An error occurred while retrieving this brew from Google Drive!
			
			Google reported an error while attempting to retrieve a brew from this link.`,

		// Google Drive - 404 : brew deleted or access denied
		'02' : dedent`
			## We can't find this brew in Google Drive!
			
			This file was saved on Google Drive, but this link doesn't work anymore.
			${ props.brew.authors?.length > 0
				? `Note that this brew belongs to the Homebrewery account **${ props.brew.authors[0] }**,
				${ props.brew.account
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
		## So ein Gebräu haben wir nicht.
		
		Ganz ehrlich. Ich hab alles durchsucht. Kein einziges Gebräu mit dieser **ID**: ${props.brew.brewId} (${props.brew.accessType}).`,

		// Brew save error
		'06' : dedent`
		## Ich konnte das Gebräu nicht sichern.
		
		Ohje, ich habe versucht es abzuspeichern, aber leider hats nicht geklappt. Ich weiß auch nicht warum.. *Hicks*`,

		// Brew delete error
		'07' : dedent`
		## Ich konnte das Gebräu nicht entfernen.
		
		Bei meinem Versuch ist ein Fehler aufgetreten. Es tut mir Leid.
		
		**Brew ID:**  ${props.brew.brewId}`,

		// Author delete error
		'08' : dedent`
		## Benutzers konnte nicht aus der Autorenliste des Gebräus gelöscht werden.
		
		Beim Löschen des Benutzers aus der Autorenliste des Gebräus trat ein Fehler auf!
		
		**Brew ID:**  ${props.brew.brewId}`,
	};
};

module.exports = errorIndex;