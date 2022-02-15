/* eslint-disable max-lines */
const _ = require('lodash');
const { google } = require('googleapis');
const { nanoid } = require('nanoid');
const token = require('./token.js');
const config = require('./config.js');

const keys = typeof(config.get('service_account')) == 'string' ?
	JSON.parse(config.get('service_account')) :
	config.get('service_account');
let serviceAuth;
try {
	serviceAuth = google.auth.fromJSON(keys);
	serviceAuth.scopes = [
		'https://www.googleapis.com/auth/drive',
		'https://www.googleapis.com/auth/drive.appdata',
		'https://www.googleapis.com/auth/drive.file',
		'https://www.googleapis.com/auth/drive.metadata'
	];
} catch (err) {
	console.warn(err);
}
google.options({ auth: serviceAuth || config.get('google_api_key') });

const GoogleActions = {

	authCheck : (account, res)=>{
		if(!account || !account.googleId){ // If not signed into Google
			const err = new Error('Not Signed In');
			err.status = 401;
			throw (err);
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
		const drive = google.drive({ version: 'v3', auth });

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
			throw (err);
		});

		let folderId;

		if(obj.data.files.length == 0){
			const obj = await drive.files.create({
				resource : fileMetadata
			})
			.catch((err)=>{
				console.log('Error creating Google Drive folder');
				console.error(err);
				throw (err);
			});

			folderId = obj.data.id;
		} else {
			folderId = obj.data.files[0].id;
		}

		return folderId;
	},

	listGoogleBrews : async (req, res)=>{

		const oAuth2Client = GoogleActions.authCheck(req.account, res);

		//TODO: Change to service account to allow non-owners to view published files.
		// Requires a driveId parameter in the drive.files.list command
		// Then remove the `auth` parameter from the drive object initialization

		const drive = google.drive({ version: 'v3', auth: oAuth2Client });

		const obj = await drive.files.list({
			pageSize : 1000,
			fields   : 'nextPageToken, files(id, name, description, createdTime, modifiedTime, properties)',
			q        : 'mimeType != \'application/vnd.google-apps.folder\' and trashed = false'
		})
		.catch((err)=>{
	    console.log(`Error Listing Google Brews`);
			console.error(err);
			throw (err);
			//TODO: Should break out here, but continues on for some reason.
	  });

		if(!obj.data.files.length) {
	    console.log('No files found.');
	  }

		const brews = obj.data.files.map((file)=>{
	    return {
				text        : '',
				shareId     : file.properties.shareId,
				editId      : file.properties.editId,
				createdAt   : file.createdTime,
				updatedAt   : file.modifiedTime,
				gDrive      : true,
				googleId    : file.id,
				pageCount   : parseInt(file.properties.pageCount),
				title       : file.properties.title,
				description : file.description,
				views       : parseInt(file.properties.views),
				tags        : '',
				published   : file.properties.published ? file.properties.published == 'true' : false,
				authors     : [req.account.username],	//TODO: properly save and load authors to google drive
				systems     : []
			};
		});
	  return brews;
	},

	existsGoogleBrew : async (id)=>{
		const drive = google.drive({ version: 'v3' });

		const result = await drive.files.get({ fileId: id })
		.catch((err)=>{
			console.log('error checking file exists...');
			console.error(err);
			return false;
		});

		if(result){return true;}

		return false;
	},

	updateGoogleBrew : async (brew)=>{
		const drive = google.drive({ version: 'v3' });

		if(await GoogleActions.existsGoogleBrew(brew.googleId) == true) {
			await drive.files.update({
				fileId   : brew.googleId,
				resource : {
					name        : `${brew.title}.txt`,
					description : `${brew.description}`,
					properties  : {
						title     : brew.title,
						published : brew.published,
						version   : brew.version,
						renderer  : brew.renderer,
						tags      : brew.tags,
						pageCount : brew.pageCount,
						systems   : brew.systems.join()
					}
				},
				media : {
					mimeType : 'text/plain',
					body     : brew.text
				}
			})
			.catch((err)=>{
				console.log('Error saving to google');
				console.error(err);
				throw (err);
				//return res.status(500).send('Error while saving');
			});
		}

		return (brew);
	},

	newGoogleBrew : async (auth, brew)=>{
		const drive = google.drive({ version: 'v3', auth });

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
				'shareId'   : nanoid(12),
				'editId'    : nanoid(12),
				'title'     : brew.title,
				'views'     : '0',
				'pageCount' : brew.pageCount,
				'renderer'  : brew.renderer || 'legacy'
			}
		};

		const obj = await drive.files.create({
			resource : fileMetadata,
			media    : media
		})
		.catch((err)=>{
			console.log('Error while creating new Google brew');
			console.error(err);
			throw (err);
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
			pageCount : fileMetadata.properties.pageCount,

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

	readFileMetadata : async (id, accessId, accessType)=>{
		const drive = google.drive({ version: 'v3' });

		const obj = await drive.files.get({
			fileId : id,
			fields : 'properties, createdTime, modifiedTime, description, trashed'
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

			const serviceDrive = google.drive({ version: 'v3' });

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
				trashed     : obj.data.trashed,

				createdAt  : obj.data.createdTime,
				updatedAt  : obj.data.modifiedTime,
				lastViewed : obj.data.properties.lastViewed,
				pageCount  : obj.data.properties.pageCount,
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
		const oAuth2Client = GoogleActions.authCheck(req.account, res);
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
		const drive = google.drive({ version: 'v3' });

		await drive.files.update({
			fileId   : brew.googleId,
			resource : {
				modifiedTime : brew.updatedAt,
				properties   : {
					views      : brew.views + 1,
		 			lastViewed : new Date()
				}
			}
		})
		.catch((err)=>{
			console.log('Error updating Google views');
			console.error(err);
			//return res.status(500).send('Error while saving');
		});
	}
};

module.exports = GoogleActions;
