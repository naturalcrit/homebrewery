const dedent = require('dedent-tabs').default;


export default function error01() {
	return {
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
	};
}
