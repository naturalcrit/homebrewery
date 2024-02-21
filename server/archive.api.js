const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const asyncHandler = require('express-async-handler');

const archive = {
	archiveApi : router,
	/* Searches for matching title, also attempts to partial match */
	findBrews  : async (req, res, next)=>{
		try {
			console.table(req.query);

			const title = req.query.title || '';
			const page = Math.max(parseInt(req.query.page) || 1, 1);
			const minPageSize = 6; 
			const pageSize = Math.max(parseInt(req.query.size) || 10, minPageSize);  
			const skip = (page - 1) * pageSize;
			
			const titleQuery = {
				title     : { $regex: decodeURIComponent(title), $options: 'i' },
				$or: [],
				published : true
			};

			if (req.query.legacy === 'true') {
                titleQuery.$or.push({ renderer: 'legacy' });
            };

            if (req.query.v3 === 'true') {
                titleQuery.$or.push({ renderer: 'V3' });
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

			const totalBrews = await HomebrewModel.countDocuments(titleQuery).maxTimeMS(5000);
            
			const totalPages = Math.ceil(totalBrews / pageSize);
            //console.log('Total brews: ', totalBrews);
            //console.log('Total pages: ', totalPages);
			return res.json({ brews, page, totalPages, totalBrews});
		} catch (error) {
			console.error(error);
            if (error.response && error.response.status === 503) {
                return res.status(503).json({ errorCode: '503', message: 'Service Unavailable' });
            } else {
                return res.status(500).json({ errorCode: '500', message: 'Internal Server Error' });
            }
		}
	}
};

router.get('/api/archive', asyncHandler(archive.findBrews));

module.exports = router;