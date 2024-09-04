require('./notificationPopup.less');
const React = require('react');
const _     = require('lodash');

import Dialog from '../../../components/dialog.jsx';

const DISMISS_KEY = 'dismiss_notification04-09-24';
const DISMISS_BUTTON = <i className='fas fa-times dismiss' />;

const NotificationPopup = ()=>{
	return <Dialog className='notificationPopup' dismissKey={DISMISS_KEY} closeText={DISMISS_BUTTON} >
		<div className='header'>
			<i className='fas fa-info-circle info'></i>
			<h3>Notice</h3>
			<small>This website is always improving and we are still adding new features and squashing bugs. Keep the following in mind:</small>
		</div>
		<ul>
			<li key='Vault'>
				<em>Search brews with our new page!</em><br />
				We have been working very hard in making this possible, now you can share your work and look at it in the new <a href="/vault">Vault</a> page!
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
