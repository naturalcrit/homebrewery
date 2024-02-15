const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const asyncHandler = require('express-async-handler');

const archive = {
	archiveApi : router,
	/* Searches for matching title, also attempts to partial match */
	findBrews  : async (req, res, next)=>{
		try {
			const title = req.query.title || '';
			const page = Math.max(parseInt(req.query.page) || 1, 1);
			console.log('trying page ', page);
			const minPageSize = 6; 
			const pageSize = Math.max(parseInt(req.query.size) || 10, minPageSize);  
			const skip = (page - 1) * pageSize;

			const titleQuery = {
				title     : { $regex: decodeURIComponent(title), $options: 'i' },
				published : true
			};
			const projection = {
				editId   : 0,
				googleId : 0,
				text     : 0,
				textBin  : 0,
			};
			const brews = await HomebrewModel.find(titleQuery, projection)
                .skip(skip)
                .limit(pageSize)
                .maxTimeMS(5000)
                .exec();
            console.log(brews.length);

			if(!brews || brews.length === 0) {
				// No published documents found with the given title
				return res.status(404).json({ error: 'Published documents not found' });
			}
			const totalBrews = await HomebrewModel.countDocuments(titleQuery, projection);
            
			const totalPages = Math.ceil(totalBrews / pageSize);
            console.log('Total brews: ', totalBrews);
            console.log('Total pages: ', totalPages);
			return res.json({ brews, page, totalPages, totalBrews});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}
};

router.get('/api/archive', asyncHandler(archive.findBrews));

module.exports = router;