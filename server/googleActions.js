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

			folderId = obj.data.id;
		} else {
			folderId = obj.data.files[0].id;
		}

		return folderId;
	},

	listGoogleBrews : async (req, res)=>{

		oAuth2Client = GoogleActions.authCheck(req.account, res);

		//TODO: Change to service account to allow non-owners to view published files.
		// Requires a driveId parameter in the drive.files.list command
		// const keys = JSON.parse(config.get('service_account'));
		// const auth = google.auth.fromJSON(keys);
		// auth.scopes = ['https://www.googleapis.com/auth/drive'];

		const drive = google.drive({ version: 'v3', auth: oAuth2Client });

		const obj = await drive.files.list({
			pageSize : 100,
			fields   : 'nextPageToken, files(id, name, description, modifiedTime, properties)',
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
	      createdAt : file.createdTime,
	      updatedAt : file.modifiedTime,
	      gDrive    : true,
	      googleId  : file.id,

	      title       : file.properties.title,
	      description : file.description,
				views       : file.properties.views,
	      tags        : '',
	      published   : file.properties.published ? file.properties.published == 'true' : false,
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
			console.log('error checking file exists...');
			console.log(err);
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
				resource : { name        : `${brew.title}.txt`,
										 description : `${brew.description}`,
										 properties  : { title   			: brew.title,
										 								published  : brew.published,
																	  lastViewed : brew.lastViewed,
																	  views      : brew.views,
																	  version    : brew.version,
						renderer   : brew.renderer,
																	  tags       : brew.tags,
																	  systems    : brew.systems.join() }
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
			'name'        : `${brew.title}.txt`,
			'description' : `${brew.description}`,
			'parents'     : [folderId],
			'properties'  : {								//AppProperties is not accessible
				'shareId' : nanoid(12),
				'editId'  : nanoid(12),
				'title'   : brew.title,
				'views'   : '0'
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
			createdAt : new Date(),
			updatedAt : new Date(),
			gDrive    : true,
			googleId  : obj.data.id,

			title       : brew.title,
			description : brew.description,
			tags        : '',
			published   : brew.published,
			renderer    : brew.renderer,
			authors     : [],
			systems     : []
		};

		return newHomebrew;
	},

	readFileMetadata : async (auth, id, accessId, accessType)=>{

		const drive = google.drive({ version: 'v3', auth: auth });

		const obj = await drive.files.get({
			fileId : id,
			fields : 'properties, createdTime, modifiedTime, description'
		})
		.catch((err)=>{
			console.log('Error loading from Google');
			throw (err);
			return;
		});

		if(obj) {
			if(accessType == 'edit' && obj.data.properties.editId != accessId){
				throw ('Edit ID does not match');
			} else if(accessType == 'share' && obj.data.properties.shareId != accessId){
				throw ('Share ID does not match');
			}

			//Access file using service account. Using API key only causes "automated query" lockouts after a while.

			const keys = typeof(config.get('service_account')) == 'string' ?
				JSON.parse(config.get('service_account')) :
				config.get('service_account');

			const serviceAuth = google.auth.fromJSON(keys);
			serviceAuth.scopes = ['https://www.googleapis.com/auth/drive'];

			const serviceDrive = google.drive({ version: 'v3', auth: serviceAuth });

			const file = await serviceDrive.files.get({
				fileId : id,
				fields : 'description, properties',
				alt    : 'media'
			})
			.catch((err)=>{
				console.log('Error getting file contents from Google');
				console.error(err);
			});

			const brew = {
				shareId : obj.data.properties.shareId,
				editId  : obj.data.properties.editId,
				title   : obj.data.properties.title,
				text    : file.data,

				description : obj.data.description,
				tags        : obj.data.properties.tags    ? obj.data.properties.tags               : '',
				systems     : obj.data.properties.systems ? obj.data.properties.systems.split(',') : [],
				authors     : [],
				published   : obj.data.properties.published ? obj.data.properties.published == 'true' : false,

				createdAt  : obj.data.createdTime,
				updatedAt  : obj.data.modifiedTime,
				lastViewed : obj.data.properties.lastViewed,
				views      : parseInt(obj.data.properties.views) || 0, //brews with no view parameter will return undefined
				version    : parseInt(obj.data.properties.version) || 0,
				renderer   : obj.data.properties.renderer ? obj.data.properties.renderer : 'legacy',

				gDrive   : true,
				googleId : id
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

		await drive.files.update({
			fileId   : googleId,
			resource : { trashed: true }
		})
		.catch((err)=>{
			console.log('Can\'t delete Google file');
			console.error(err);
		});

		return res.status(200).send();
	},

	increaseView : async (id, accessId, accessType, brew)=>{
		//service account because this is modifying another user's file properties
		//so we need extended scope
		const keys = typeof(config.get('service_account')) == 'string' ?
			JSON.parse(config.get('service_account')) :
			config.get('service_account');

		const auth = google.auth.fromJSON(keys);
		auth.scopes = ['https://www.googleapis.com/auth/drive'];

		const drive = google.drive({ version: 'v3', auth: auth });

		await drive.files.update({
			fileId   : brew.googleId,
			resource : { properties : { views      : brew.views + 1,
		 															lastViewed : new Date() } }
		})
		.catch((err)=>{
			console.log('Error updating Google views');
			console.error(err);
			//return res.status(500).send('Error while saving');
		});

		return;
	}
};

module.exports = GoogleActions;
