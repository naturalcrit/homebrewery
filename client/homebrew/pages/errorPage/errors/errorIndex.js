import dedent from 'dedent';

const loginUrl = 'https://www.naturalcrit.com/login';

// Prevent parsing text (e.g. document titles) as markdown
const escape = (text = '')=>{
	text = String(text);
	return text.replace(/[^a-zA-Z0-9 ]/g, (char)=>`&#${char.charCodeAt(0)};`);
};

const authorLinks = (authors = []) =>
	authors
		.map((author) => `[${escape(author)}](/user/${encodeURIComponent(author)})`)
		.join(', ');


const errorIndex = (errorCode, props = {})=>{
	//NOTE: errorCode is a string, not a number, and switch() uses strict equality ===
	//			01-51 : Brew errors
	//			52-99 : Other pages errors

	switch(errorCode) {

		// Default catch all
		case '00':
			return dedent`
				## An unknown error occurred!

				We aren't sure what happened, but our server wasn't able to find what you
				were looking for.`;

		// General Google load error
		case '01':
			return dedent`
				## An error occurred while retrieving this brew from Google Drive!

				Google is able to see the brew at this link, but reported an error while attempting to retrieve it.

				### Refreshing your Google Credentials

				This issue is likely caused by an issue with your Google credentials; if you are the owner of this file, the following steps may resolve the issue:

				- Go to ${loginUrl} and click logout if present (in small text at the bottom of the page).
				- Click "Sign In with Google", which will refresh your Google credentials.
				- After completing the sign in process, return to Homebrewery and refresh/reload the page so that it can pick up the updated credentials.
				- If this was the source of the issue, it should now be resolved.

				If following these steps does not resolve the issue, please let us know!`;


		// ####### Brew Page Errors ...

		// Google Drive - 404 : brew deleted or access denied
		case '02':
			return dedent`
				## We can't find this brew in Google Drive!

				This file was saved on Google Drive, but this link doesn't work anymore.
				${props.brew.authors?.length > 0
					? `Note that this brew belongs to the Homebrewery account **${escape(props.brew.authors[0])}**,
				${props.brew.account
					? `which is
				${props.brew.authors[0] === props.brew.account
					? `your account.`
					: `not your account (you are currently signed in as **${escape(props.brew.account)}**).`
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
					brew title and choosing *transfer my brew to/from Google Drive*.`;

		// User is not Authors list
		case '03':
			return dedent`
				## Current signed-in user does not have editor access to this brew.

				If you believe you should have access to this brew, ask one of its authors to invite you
				as an author by opening the Edit page for the brew, viewing the {{fa,fa-info-circle}}
				**Properties** tab, and adding your username to the "invited authors" list. You can
				then try to access this document again.

				:

				**Brew Title:** ${escape(props.brew.brewTitle) || 'Unable to show title'}

				**Current Authors:** ${authorLinks(props.brew?.authors) || 'Unable to list authors'}${authorLinks(props.brew?.authors) || 'Unable to list authors'}

				[Click here to be redirected to the brew's share page.](/share/${props.brew.shareId})`;

		// User is not signed in; must be a user on the Authors List
		case '04':
			return dedent`
				## Sign-in required to edit this brew.

				You must be logged in to one of the accounts listed as an author of this brew.
				User is not logged in. Please log in [here](${loginUrl}).

				:

				**Brew Title:** ${escape(props.brew.brewTitle) || 'Unable to show title'}

				**Current Authors:** ${authorLinks(props.brew?.authors) || 'Unable to list authors'}

				[Click here to be redirected to the brew's share page.](/share/${props.brew.shareId})`;

		// Brew load error
		case '05':
			return dedent`
				## No Homebrewery document could be found.

				The server could not locate the Homebrewery document. It was likely deleted by
				its owner.

				:

				**Requested access:** ${props.brew.accessType}

				**Brew ID:**	${props.brew.brewId}`;

		// Brew save error
		case '06':
			return dedent`
				## Unable to save Homebrewery document.

				An error occurred while attempting to save the Homebrewery document.`;

		//Brew delete error
		case '07':
			return dedent`
				## Unable to delete Homebrewery document.

				An error occurred while attempting to remove the Homebrewery document.

				:

				**Brew ID:**	${props.brew.brewId}`;

		//Author delete error
		case '08':
			return dedent`
				## Unable to remove user from Homebrewery document.

				An error occurred while attempting to remove the user from the Homebrewery document author list!

				:

				**Brew ID:**	${props.brew.brewId}`;

		//Theme load error
		case '09':
			return dedent`
				## No Homebrewery theme document could be found.

				The server could not locate the Homebrewery document. It was likely deleted by
				its owner.

				:

				**Requested access:** ${props.brew.accessType}

				**Brew ID:**	${props.brew.brewId}`;

		//Theme Not Valid
		case '10':
			return dedent`
				## The selected theme is not tagged as a theme.

				The brew selected as a theme exists, but has not been marked for use as a theme with the \`theme:meta\` tag.

				If the selected brew is your document, you may designate it as a theme by adding the \`theme:meta\` tag.`;

		//ID validation error
		case '11':
			return dedent`
				## No Homebrewery document could be found.

				The server could not locate the Homebrewery document. The Brew ID failed the validation check.

				:

				**Brew ID:**	${props.brew.brewId}`;

		//Google ID validation error
		case '12':
			return dedent`
				## No Google document could be found.

				The server could not locate the Google document. The Google ID failed the validation check.

				:

				**Brew ID:**	${props.brew.brewId}`;

		//Database Connection Lost
		case '13':
			return dedent`
				## Database connection has been lost.

				The server could not communicate with the database.`;

		//account page when account is not defined
		case '50':
			return dedent`
				## You are not signed in.

				You are trying to access the account page, but are not signed in to an account.

				Please login or signup at our [login page](${loginUrl}?redirect=https://homebrewery.naturalcrit.com/account).`;

		//Brew locked by Administrators error
		case '51':
			return dedent`
				## This brew has been locked.

				Only an author may request that this lock is removed.

				:

				**Brew ID:**	${props.brew.brewId}

				**Brew Title:** ${escape(props.brew.brewTitle)}

				**Brew Authors:**	 ${authorLinks(props.brew?.authors) || 'Unable to list authors'}`;


		//####### Admin page error #######

		case '52':
			return dedent`
				## Access Denied
				You need to provide correct administrator credentials to access this page.`;


		// ####### Lock Errors
		case '60':
			return dedent`Lock Error: General`;

		case '61':
			return dedent`Lock Get Error: Unable to get lock count`;

		case '62':
			return dedent`Lock Set Error: Cannot lock`;

		case '63':
			return dedent`Lock Set Error: Brew not found`;

		case '64':
			return dedent`Lock Set Error: Already locked`;

		case '65':
			return dedent`Lock Remove Error: Cannot unlock`;

		case '66':
			return dedent`Lock Remove Error: Brew not found`;

		case '67':
			return dedent`Lock Remove Error: Not locked`;

		case '68':
			return dedent`Lock Get Review Error: Cannot get review requests`;

		case '69':
			return dedent`Lock Set Review Error: Cannot set review request`;

		case '70':
			return dedent`Lock Set Review Error: Brew not found`;

		case '71':
			return dedent`Lock Set Review Error: Review already requested`;

		case '72':
			return dedent`Lock Remove Review Error: Cannot clear review request`;

		case '73':
			return dedent`Lock Remove Review Error: Brew not found`;


		// ####### Other Errors

		case '90':
			return dedent`An unexpected error occurred while looking for these brews.
				Try again in a few minutes.`;

		case '91':
			return dedent`An unexpected error occurred while trying to get the total of brews.`;


		// ####### Default unknown error

		default:
			return `
				# An unexpected error occurred.
				So unexpected we don't even have an error message for the code (${escape(errorCode)}).`;	}
};

export { escape, authorLinks };
export default errorIndex;
