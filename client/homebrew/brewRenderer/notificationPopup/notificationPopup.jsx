require('./notificationPopup.less');
const React = require('react');
const _     = require('lodash');

import Dialog from '../../../components/dialog.jsx';

const DISMISS_KEY = 'dismiss_notification12-04-23';

const NotificationPopup = (props)=>{
	return <Dialog className='notificationPopup' dismissKey={DISMISS_KEY} blocking={false} {...props} >
		<div className='header'>
			<h3>Notice</h3>
			<small>This website is always improving and we are still adding new features and squashing bugs. Keep the following in mind:</small>
		</div>
		<ul>
			<li key='psa'>
				<em>Don't store IMAGES in Google Drive</em><br />
				Google Drive is not an image service, and will block images from being used
				in brews if they get more views than expected. Google has confirmed they won't fix
				this, so we recommend you look for another image hosting service such as imgur, ImgBB or Google Photos.
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
