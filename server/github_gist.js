const { Octokit } = require('octokit');
const { createTokenAuth } = require('@octokit/auth-token');

const config = require('./config.js');

const gistHelpers = {
	gistsActive : ()=>{ return gistsActive; },
	findGist    : async (octo, brew)=>{
		// Get all of the users Gists and awlk through them until one as the brew.editId as a filename.
		// ASSUME there cannot be collisions. Which is probably dumb.
		const findRes = await octo.request('GET /gists', {
			headers : {
			  'X-GitHub-Api-Version' : '2022-11-28'
			}
		  });
		if(findRes.status == 200) {
			for (gist of findRes.data) {
				if(gist.files.hasOwnProperty(brew.editId)) {
					brew.gistId = gist.id;
				}
			}
		}
	},
	gistGetText : async (brew)=>{
		const octo = new Octokit({
			auth : brew.ghToken
		});

		const {
			data: { login },
		} = await octo.rest.users.getAuthenticated();


		if(!brew.hasOwnProperty('gistId')){
			await gistHelpers.findGist(octo, brew);
		}

		if(!brew.hasOwnProperty('gistId')){
			console.warn(`Unable to find Gist Id for read for brew ${brew.editId}`);
			return undefined;
		}

		const res = await octo.request(`GET /gists/${brew.gistId}`, {
			gist_id : brew.gistId,
			headers : {
			  'X-GitHub-Api-Version' : '2022-11-28'
			}
		  });
		return res.data.files[brew.editId].content;
	},
	gistPutText : async(brew)=>{
		const octo = new Octokit({
			auth : brew.ghToken
		});

		const {
			data: { login },
		} = await octo.rest.users.getAuthenticated();

		if(!brew.hasOwnProperty('gistId')){
			await gistHelpers.findGist(octo, brew);
		}

		if(!brew.hasOwnProperty('gistId')){
			// Create the file, it has never been saved.
			const files = {};
			files[brew.editId] = {
				content : brew.text
			};
			const patchRes = await octo.request(`POST /gists/`, {
				gist_id     : brew.gistId,
				description : brew.description,
				headers     : {
					'X-GitHub-Api-Version' : '2022-11-28'
				},
				files
			});
			if((patchRes.status != 200) || (patchRes.status != 201)) {
				console.log(`Unable to save new brew. Status: ${patchRes.status}`);
				return false;
			}
			return true;
		}

		const res = await octo.request(`GET /gists/${brew.gistId}`, {
			gist_id : brew.gistId,
			headers : {
			  'X-GitHub-Api-Version' : '2022-11-28'
			}
		  });

		if(res.status == 200){
			if(res.data.files[brew.editId].content != brew.text) {
			// Update existing gist.
				const files = {};
				files[brew.editId] = {
					content : brew.text
				};
				const patchRes = await octo.request(`PATCH /gists/${brew.gistId}`, {
					gist_id     : brew.gistId,
					description : brew.description,
					headers     : {
						'X-GitHub-Api-Version' : '2022-11-28'
					},
					files
				});
				if(patchRes.status != 200) {
					console.log(`Unable to update. Status: ${patchRes.status}`);
					return false;
				}
			}
			return true;
		} else {
			console.log(`Unable to verify Gist. Status ${res.status}`);
			return false;
		}
	},
	deleteGist : async (brew)=>{
		console.log(`Using ${brew.ghToken}`);
		const octo = new Octokit({
			auth : brew.ghToken
		});

		const {
			data: { login },
		} = await octo.rest.users.getAuthenticated();

		console.log(`confirmed used: ${login}`);

		if(!brew.hasOwnProperty('gistId')){
			await gistHelpers.findGist(octo, brew);
		}

		if(!brew.hasOwnProperty('gistId')) {
			console.log('Unable to find gist for brew ${brew.editId}');
			return false;
		}

		const delResults = await octo.request(`DELETE /gists/${brew.gistId}`, {
			gist_id : brew.gistId,
			headers : {
			  'X-GitHub-Api-Version' : '2022-11-28'
			}
		  });

		if(delResults.status == 204) return true;

		console.log(`Unable to remove gist for ${brew.editId}: ${delResults.status}`);

		return false;

	}
};

if(config.get('enable_gists')) {
	gistsActive = true;
}

module.exports = gistHelpers;