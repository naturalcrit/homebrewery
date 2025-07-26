const dedent = require('dedent-tabs').default;

export default function error02(props) {
	return {
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
	};
}
