const HomebrewModel = require.main.require('./server/homebrew.model.js').model;
const sanitizeFilename = require('sanitize-filename');

const shareFunction = function(req, res, type) {
	if(req.params.id.length > 12) {
		const googleId = req.params.id.slice(0, -12);
		const shareId = req.params.id.slice(-12);
		GoogleActions.readFileMetadata(config.get('google_api_key'), googleId, shareId, 'share')
		.then((brew)=>{
			if(type == 'source') {
				return res.status(200).send(brew.escapeTextForHtmlDisplay());
			} else if(type == 'download') {
				let fileName = sanitizeFilename(brew.title);
				fileName = fileName.replaceAll(' ', '-');
				if(!fileName || !fileName.length) {
					fileName = 'Untitled-Brew';
				}
				res.status(200);
				res.set({
					'Cache-Control'       : 'no-cache',
					'Content-Type'        : 'text/plain',
					'Content-Disposition' : `attachment; filename="HomeBrewery-${fileName}.txt"`
				});
				return res.send(brew.text);
			} else {
				console.log('Unhandled source share type');
			}
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send('Can\'t get brew from Google');
		});
	} else {
		HomebrewModel.get({ shareId: req.params.id })
			.then((brew)=>{
				if(type == 'source') {
					return res.status(200).send(brew.escapeTextForHtmlDisplay());
				} else if(type == 'download') {
					let fileName = sanitizeFilename(brew.title);
					fileName = fileName.replaceAll(' ', '-');
					res.status(200);
					res.set({
						'Cache-Control'       : 'no-cache',
						'Content-Type'        : 'text/plain',
						'Content-Disposition' : `attachment; filename="HomeBrewery-${fileName}.txt"`
					});
					return res.send(brew.text);
				} else {
					console.log('Unhandled share type');
				}
			})
			.catch((err)=>{
				console.log(err);
				return res.status(404).send('Could not find Homebrew with that id');
			});
	}
};

module.exports = shareFunction;