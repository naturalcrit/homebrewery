const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const asyncHandler = require('express-async-handler');

const archive = {
    archiveApi: router,
    /* Searches for matching title, also attempts to partial match */
    findBrews: async (req, res, next) => {
        try {
            const title = req.query.title || '';
            const page = parseInt(req.query.page) || 1;
            console.log('try:',page);
            const pageSize = 10; // Set a default page size
            const skip = (page - 1) * pageSize;

            const titleQuery = {
                title: { $regex: decodeURIComponent(title), $options: 'i' },
                published: true
            };

            const projection = {
                editId: 0,
                googleId: 0,
                text: 0,
                textBin: 0,
            };

            const brews = await HomebrewModel.find(titleQuery, projection)
                .skip(skip)
                .limit(pageSize)
                .maxTimeMS(5000)
                .exec();

            if (!brews || brews.length === 0) {
                // No published documents found with the given title
                return res.status(404).json({ error: 'Published documents not found' });
            }

            const totalDocuments = await HomebrewModel.countDocuments(title);

            const totalPages = Math.ceil(totalDocuments / pageSize);

            return res.json({ brews, page, totalPages});
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

router.get('/archive', asyncHandler(archive.findBrews));

module.exports = router;