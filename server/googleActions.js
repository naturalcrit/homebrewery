/* eslint-disable max-lines */
import googleDrive from '@googleapis/drive';
import { nanoid }  from 'nanoid';
import token       from './token.js';
import config      from './config.js';


let serviceAuth;
let clientEmail;
if(!config.get('service_account')){
	const reset = '\x1b[0m'; // Reset to default style
	const yellow = '\x1b[33m'; // yellow color
	console.warn(`\n${yellow}No Google Service Account in config files - Google Drive integration will not be available.${reset}`);
} else  {
	const keys = typeof(config.get('service_account')) == 'string' ?
		JSON.parse(config.get('service_account')) :
		config.get('service_account');

	if(keys?.client_email) {
		clientEmail = keys.client_email;
	}

	try {
		serviceAuth = googleDrive.auth.fromJSON(keys);
		serviceAuth.scopes = ['https://www.googleapis.com/auth/drive'];
	} catch (err) {
		console.warn(err);
		console.warn('Please make sure the Google Service Account is set up properly in your config files.');
	}
}

const defaultAuth = serviceAuth || config.get('google_api_key');

const retryConfig = {
	retry                : 3, // Number of retry attempts
	retryDelay           : 100, // Initial delay in milliseconds
	retryDelayMultiplier : 2, // Multiplier for exponential backoff
	maxRetryDelay        : 32000, // Maximum delay in milliseconds
	httpMethodsToRetry   : ['PATCH'], // Only retry PATCH requests
	statusCodesToRetry   : [[429, 429]], // Only retry on 429 status code
};

const GoogleActions = {

	authCheck : (account, res, updateTokens=true)=>{
		if(!account || !account.googleId){ // If not signed into Google
			const err = new Error('Not Signed In');
			err.status = 401;
			throw (err);
		}

		const oAuth2Client = new googleDrive.auth.OAuth2(
			config.get('google_client_id'),
			config.get('google_client_secret'),
			'/auth/google/redirect'
		);

		oAuth2Client.setCredentials({
			access_token  : account.googleAccessToken, //Comment out to refresh token
			refresh_token : account.googleRefreshToken
		});

		updateTokens && oAuth2Client.on('tokens', (tokens)=>{
			if(tokens.refresh_token) {
				account.googleRefreshToken = tokens.refresh_token;
			}
			account.googleAccessToken = tokens.access_token;
			const JWTToken = token(account);

			//Save updated token to cookie
			//res.cookie('nc_session', JWTToken, { maxAge: 1000*60*60*24*365, path: '/', sameSite: 'lax' });
			res.cookie('nc_session', JWTToken, { maxAge: 1000*60*60*24*365, path: '/', sameSite: 'lax', domain: '.naturalcrit.com' });
		});

		return oAuth2Client;
	},

	getGoogleFolder : async (auth)=>{
		const drive = googleDrive.drive({ version: 'v3', auth });

		const fileMetadata = {
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

	listGoogleBrews : async (auth)=>{
		const drive = googleDrive.drive({ version: 'v3', auth });

		const fileList = [];
		let NextPageToken = '';

		do {
			const obj = await drive.files.list({
				pageSize  : 1000,
				pageToken : NextPageToken || '',
				fields    : 'nextPageToken, files(id, name, description, createdTime, modifiedTime, properties, webViewLink)',
				q         : 'mimeType != \'application/vnd.google-apps.folder\' and trashed = false'
			})
			.catch((err)=>{
				console.log(`Error Listing Google Brews`);
				throw (err);
			});
			fileList.push(...obj.data.files);
			NextPageToken = obj.data.nextPageToken;
		} while (NextPageToken);

		if(!fileList.length) {
			console.log('No files found.');
		}

		const brews = fileList.map((file)=>{
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
				published   : file.properties.published ? file.properties.published == 'true' : false,
				systems     : [],
				lang        : file.properties.lang,
				thumbnail   : file.properties.thumbnail,
				webViewLink : file.webViewLink
			};
		});
	  return brews;
	},

	updateGoogleBrew : async (brew, userIp)=>{
		const drive = googleDrive.drive({ version: 'v3', auth: defaultAuth });

		await drive.files.update({
			fileId   : brew.googleId,
			resource : {
				name        : `${brew.title}.txt`,
				description : `${brew.description}`,
				properties  : {
					title     : brew.title,
					shareId   : brew.shareId || nanoid(12),
					editId    : brew.editId || nanoid(12),
					pageCount : brew.pageCount,
					renderer  : brew.renderer || 'legacy',
					isStubbed : true,
					lang      : brew.lang || 'en'
				}
			},
			media : {
				mimeType : 'text/plain',
				body     : brew.text
			},
			headers : {
				'X-Forwarded-For' : userIp, // Set the X-Forwarded-For header
			},
			retryConfig
		})
		.catch((err)=>{
			console.log('Error saving to google');
			throw (err);
		});

		return true;
	},

	newGoogleBrew : async (auth, brew)=>{
		const drive = googleDrive.drive({ version: 'v3', auth });

		const media = {
			mimeType : 'text/plain',
			body     : brew.text
		};

		const folderId = await GoogleActions.getGoogleFolder(auth);

		const fileMetadata = {
			name        : `${brew.title}.txt`,
			description : `${brew.description}`,
			parents     : [folderId],
			properties  : {								//AppProperties is not accessible
				shareId   : brew.shareId || nanoid(12),
				editId    : brew.editId || nanoid(12),
				title     : brew.title,
				pageCount : brew.pageCount,
				renderer  : brew.renderer || 'legacy',
				isStubbed : true,
				version   : 1,
				lang      : brew.lang || 'en'
			}
		};

		const obj = await drive.files.create({
			resource : fileMetadata,
			media    : media
		})
		.catch((err)=>{
			console.log('Error while creating new Google brew');
			throw (err);
		});

		if(!obj) return;

		if(clientEmail) {
			await drive.permissions.create({
				resource : {
					type         : 'user',
					emailAddress : clientEmail,
					role         : 'writer'
				},
				fileId : obj.data.id,
				fields : 'id',
			})
			.catch((err)=>{
				console.log('Error adding Service Account permissions on Google Drive file');
				console.error(err);
			});
		}

		await drive.permissions.create({
			resource : { type : 'anyone',
			             role : 'writer' },
			fileId : obj.data.id,
			fields : 'id',
		})
		.catch((err)=>{
			console.log('Error adding "Anyone" permissions on Google Drive file');
			console.error(err);
		});

		return obj.data.id;
	},

	getGoogleBrew : async (auth = defaultAuth, id, accessId, accessType)=>{
		const drive = googleDrive.drive({ version: 'v3', auth: auth });

		const obj = await drive.files.get({
			fileId : id,
			fields : 'properties, createdTime, modifiedTime, description, trashed'
		})
		.catch((err)=>{
			console.log('Error loading from Google');
			throw (err);
		});

		if(obj) {
			if(accessType == 'edit' && obj.data.properties.editId != accessId){
				throw ({ message: 'Edit ID does not match' });
			} else if(accessType == 'share' && obj.data.properties.shareId != accessId){
				throw ({ message: 'Share ID does not match' });
			}

			const file = await drive.files.get({
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
				systems     : obj.data.properties.systems ? obj.data.properties.systems.split(',') : [],
				authors     : [],
				lang        : obj.data.properties.lang,
				published   : obj.data.properties.published ? obj.data.properties.published == 'true' : false,
				trashed     : obj.data.trashed,

				createdAt  : obj.data.createdTime,
				updatedAt  : obj.data.modifiedTime,
				lastViewed : obj.data.properties.lastViewed,
				pageCount  : obj.data.properties.pageCount,
				views      : parseInt(obj.data.properties.views) || 0, //brews with no view parameter will return undefined
				version    : parseInt(obj.data.properties.version) || 0,
				renderer   : obj.data.properties.renderer ? obj.data.properties.renderer : 'legacy',

				googleId : id
			};

			return (brew);
		}
	},

	deleteGoogleBrew : async (auth, id, accessId)=>{
		const drive = googleDrive.drive({ version: 'v3', auth });

		const obj = await drive.files.get({
			fileId : id,
			fields : 'properties'
		})
		.catch((err)=>{
			console.log('Error loading from Google');
			console.error(err);
		});

		if(obj && obj.data.properties.editId != accessId) {
			throw { status: 403, message: 'Not authorized to delete this Google brew' };
		}

		await drive.files.update({
			fileId   : id,
			resource : { trashed: true }
		})
		.catch((err)=>{
			console.log('Can\'t delete Google file');
			console.error(err);
		});
	},

	increaseView : async (id, accessId, accessType, brew)=>{
		const drive = googleDrive.drive({ version: 'v3', auth: defaultAuth });

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

export default GoogleActions;
