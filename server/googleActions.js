/* eslint-disable max-lines */
const _ = require('lodash');
const { google } = require('googleapis');
const { nanoid } = require('nanoid');
const token = require('./token.js');
const config = require('nconf')
	.argv()
	.env({ lowerCase: true })	// Load environment variables
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

//let oAuth2Client;

GoogleActions = {

	authCheck : (account, res)=>{
		if(!account || !account.googleId){ // If not signed into Google
			const err = new Error('Not Signed In');
			err.status = 401;
			throw err;
		}

		const oAuth2Client = new google.auth.OAuth2(
			config.get('google_client_id'),
			config.get('google_client_secret'),
			'/auth/google/redirect'
		);

		oAuth2Client.setCredentials({
			access_token  : account.googleAccessToken, //Comment out to refresh token
			refresh_token : account.googleRefreshToken
		});

		oAuth2Client.on('tokens', (tokens)=>{
			if(tokens.refresh_token) {
				account.googleRefreshToken = tokens.refresh_token;
			}
			account.googleAccessToken = tokens.access_token;
			const JWTToken = token.generateAccessToken(account);

			//Save updated token to cookie
			//res.cookie('nc_session', JWTToken, { maxAge: 1000*60*60*24*365, path: '/', sameSite: 'lax' });
			res.cookie('nc_session', JWTToken, { maxAge: 1000*60*60*24*365, path: '/', sameSite: 'lax', domain: '.naturalcrit.com' });
		});

		return oAuth2Client;
	},

	getGoogleFolder : async (auth)=>{
		const drive = google.drive({ version: 'v3', auth: auth });

		fileMetadata = {
			'name'     : 'Homebrewery',
			'mimeType' : 'application/vnd.google-apps.folder'
		};

		const obj = await drive.files.list({
			q : 'mimeType = \'application/vnd.google-apps.folder\''
		})
		.catch((err)=>{
			console.log('Error searching Google Drive Folders');
			console.error(err);
		});

		let folderId;

		if(obj.data.files.length == 0){
			const obj = await drive.files.create({
				resource : fileMetadata
			})
			.catch((err)=>{
				console.log('Error creating google app folder');
				console.error(err);
			});

			console.log('created new drive folder with ID:');
			console.log(obj.data.id);
			folderId = obj.data.id;
		} else {
			folderId = obj.data.files[0].id;
		}

		return folderId;
	},

	listGoogleBrews : async (req, res)=>{

		oAuth2Client = GoogleActions.authCheck(req.account, res);

		const drive = google.drive({ version: 'v3', auth: oAuth2Client });

		const obj = await drive.files.list({
			pageSize : 100,
			fields   : 'nextPageToken, files(id, name, modifiedTime, properties)',
			q        : 'mimeType != \'application/vnd.google-apps.folder\' and trashed = false'
		})
		.catch((err)=>{
	    return console.error(`Error Listing Google Brews: ${err}`);
	  });

		if(!obj.data.files.length) {
	    console.log('No files found.');
	  }

		const brews = obj.data.files.map((file)=>{
	    return {
	      text      : '',
	      shareId   : file.properties.shareId,
	      editId    : file.properties.editId,
	      createdAt : null,
	      updatedAt : file.modifiedTime,
	      gDrive    : true,
	      googleId  : file.id,

	      title       : file.properties.title,
	      description : '',
	      tags        : '',
	      published   : false,
	      authors     : [req.account.username],	//TODO: properly save and load authors to google drive
	      systems     : []
	    };
	  });

	  return brews;
	},

	existsGoogleBrew : async (auth, id)=>{
		const drive = google.drive({ version: 'v3', auth: auth });

		const result = await drive.files.get({ fileId: id })
		.catch((err)=>{
			return false;
		});

		if(result){return true;}

		return false;
	},

	updateGoogleBrew : async (auth, brew)=>{
		const drive = google.drive({ version: 'v3', auth: auth });

		if(await GoogleActions.existsGoogleBrew(auth, brew.googleId) == true) {

			await drive.files.update({
				fileId   : brew.googleId,
				resource : { name       : `${brew.title}.txt`,
										 properties : { title: brew.title } //AppProperties is not accessible via API key
									 },
				media : { mimeType : 'text/plain',
										 body     : brew.text }
			})
			.catch((err)=>{
				console.log('Error saving to google');
				console.error(err);
				//return res.status(500).send('Error while saving');
			});
		}

		return (brew);
	},

	newGoogleBrew : async (auth, brew)=>{
		const drive = google.drive({ version: 'v3', auth: auth });

		const media = {
			mimeType : 'text/plain',
			body     : brew.text
		};

		const folderId = await GoogleActions.getGoogleFolder(auth);

		const fileMetadata = {
			'name'       : `${brew.title}.txt`,
			'parents'    : [folderId],
			'properties' : {								//AppProperties is not accessible
				'shareId' : nanoid(12),
				'editId'  : nanoid(12),
				'title'   : brew.title,
			}
		};

		const obj = await drive.files.create({
			resource : fileMetadata,
			media    : media
		})
		.catch((err)=>{
			console.error(err);
			return res.status(500).send('Error while creating google brew');
		});

		if(!obj) return;

		await drive.permissions.create({
			resource : { type : 'anyone',
									 role : 'writer' },
			fileId : obj.data.id,
			fields : 'id',
		})
		.catch((err)=>{
			console.log('Error updating permissions');
			console.error(err);
		});

		const newHomebrew = {
			text      : brew.text,
			shareId   : fileMetadata.properties.shareId,
			editId    : fileMetadata.properties.editId,
			createdAt : null,
			updatedAt : null,
			gDrive    : true,
			googleId  : obj.data.id,

			title       : brew.title,
			description : '',
			tags        : '',
			published   : false,
			authors     : [],
			systems     : []
		};

		return newHomebrew;
	},

	readFileMetadata : async (auth, id, accessId, accessType)=>{
		const drive = google.drive({ version: 'v3', auth: auth });

		const obj = await drive.files.get({
			fileId : id,
			fields : 'properties'
		})
		.catch((err)=>{
			console.log('Error loading from Google');
			console.error(err);
			return;
		});

		if(obj) {
			if(accessType == 'edit' && obj.data.properties.editId != accessId){
				throw ('Edit ID does not match');
			} else if(accessType == 'share' && obj.data.properties.shareId != accessId){
				throw ('Share ID does not match');
			}

			const file = await drive.files.get({
				fileId : id,
				alt    : 'media'
			})
			.catch((err)=>{
				console.log('Error getting file contents from Google');
				console.error(err);
			});

			const brew = {
				text      : file.data,
				shareId   : obj.data.properties.shareId,
				editId    : obj.data.properties.editId,
				createdAt : null,
				updatedAt : null,
				gDrive    : true,
				googleId  : id,

				title       : obj.data.properties.title,
				description : '',
				tags        : '',
				published   : false,
				authors     : [],
				systems     : []
			};

			return (brew);
		}
	},

	deleteGoogleBrew : async (req, res, id)=>{

		oAuth2Client = GoogleActions.authCheck(req.account, res);
		const drive = google.drive({ version: 'v3', auth: oAuth2Client });

		const googleId = id.slice(0, -12);
		const accessId = id.slice(-12);

		const obj = await drive.files.get({
			fileId : googleId,
			fields : 'properties'
		})
		.catch((err)=>{
			console.log('Error loading from Google');
			console.error(err);
			return;
		});

		if(obj && obj.data.properties.editId != accessId) {
			throw ('Not authorized to delete this Google brew');
		}

		await drive.files.delete({
			fileId : googleId
		})
		.catch((err)=>{
			console.log('Can\'t delete Google file');
			console.error(err);
		});

		return res.status(200).send();
	}
};

module.exports = GoogleActions;
