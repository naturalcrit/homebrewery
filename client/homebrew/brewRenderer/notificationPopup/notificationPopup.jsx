require('./notificationPopup.less');
const React = require('react');
const _     = require('lodash');

import Dialog from '../../../components/dialog.jsx';

const DISMISS_KEY = 'dismiss_notification01-10-24';
const DISMISS_BUTTON = <i className='fas fa-times dismiss' />;

const NotificationPopup = ()=>{
	return <Dialog className='notificationPopup' dismissKey={DISMISS_KEY} closeText={DISMISS_BUTTON} >
		<div className='header'>
			<i className='fas fa-info-circle info'></i>
			<h3>Notice</h3>
			<small>This website is always improving and we are still adding new features and squashing bugs. Keep the following in mind:</small>
		</div>
		<ul>
			<li key='ThrottlingError' style={{
					backgroundColor: '#910000',
					margin: '-10px -10px -10px -20px',
					padding: '10px 10px 10px 20px',
					fontSize: '1.0em'
				}}>
				<em>Known issue with saving/creating Google Drive files</em><br />
				Dear users. The <a href="https://github.com/naturalcrit/homebrewery/issues/3770">
				issue with saving to Google Drive</a> has resurfaced as of Oct 1, 2024 22:00 UTC.
				<br></br><br></br>
				Earlier we submitted a bug report to Google and have all but confirmed the issue
				lies on Google's end and the disruption has been affecting multiple other
				organizations besides us. Unfortunately, it means reliable interaction with
				Google remains out of our control until they can resolve their issue.
				<br></br><br></br>
				Brews saved to Google Drive are <em>not lost</em> and can still be viewed, just not updated.
				You can also access them via your Google Drive interface in the <code>/Hombrewery</code> folder.
				<br></br><br></br>
				If you need to urgently edit documents, you can detatch them from your Google Drive
				by transferring them to our Homebrewery storage. To do this, click the colored Google Drive
				icon next to the save button when on an edit page; you can transfer them back later,
				but this should allow you to edit while this issue is ongoing.
				<br></br><br></br>
				If you are experiencing errors creating new documents, you can similarly change your
				account settings to create new brews by default in the Homebrewery storage. Click
				your username and then "account", then change the "default save location".
			</li>

			<li key='Vault'>
				<em>Search brews with our new page!</em><br />
				We have been working very hard in making this possible, now you can share your work and look at it in the new <a href='/vault'>Vault</a> page!
				All PUBLISHED brews will be available to anyone searching there, by title or author, and filtering by renderer.

				More features will be coming.
			</li>

			<li key='googleDriveFolder'>
				<em>Don't delete your Homebrewery folder on Google Drive!</em> <br />
				We have had several reports of users losing their brews, not realizing
				that they had deleted the files on their Google Drive. If you have a Homebrewery folder
				on your Google Drive with *.txt files inside, <em>do not delete it</em>!
				We cannot help you recover files that you have deleted from your own
				Google Drive.
			</li>

			<li key='faq'>
				<em>Protect your work! </em> <br />
				If you opt not to use your Google Drive, keep in mind that we do not save a history of your projects. Please make frequent backups of your brews!&nbsp;
				<a target='_blank' href='https://www.reddit.com/r/homebrewery/comments/adh6lh/faqs_psas_announcements/'>
					See the FAQ
				</a> to learn how to avoid losing your work!
			</li>
		</ul>
	</Dialog>;
};

module.exports = NotificationPopup;
