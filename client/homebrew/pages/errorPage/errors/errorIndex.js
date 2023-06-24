const dedent = require('dedent-tabs').default;

const errorIndex = () => {
	return {
			"404" : dedent`
				## We can't find this brew in your Google Drive!
				
				This error tells us your file was saved on your Google Drive, but the link
				you tried to open doesn't work anymore. The Homebrewery cannot delete files
				from your Google Drive on its own, so there are three most likely possibilities:
				:
				- **You may have accidentally deleted the Google Drive files.** Look on your Google Drive
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
				brew title and choosing *transfer my brew to/from Google Drive*.`
	};
};

module.exports = errorIndex;