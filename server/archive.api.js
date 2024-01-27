const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const asyncHandler = require('express-async-handler');

const archive = {
    archiveApi: router,
    /* Searches for matching title, also attempts to partial match */
    findBrews: async (req, res, next) => {
        try {
            const limit = 2000;
            const brews = await HomebrewModel.find({
                title: { $regex: req.params.query, $options: 'i' },
                editId:0,
                googleId:0,
                text:0,
                textBin:0,
                published: true
            })
            .limit(limit)
            .maxTimeMS(10000)
            .exec();

            if (!brews || brews.length === 0) {
                // No published documents found with the given title
                return res.status(404).json({ error: 'Published documents not found' });
            }

            let message = '';
            if (brews.length === limit) {
                // If the limit has been reached, include a message in the response
                message = `You've reached the limit of ${limit} documents, you can try being more specific in your search.`;
            }

            return res.json({ brews, message });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

router.get('/archive/:query', asyncHandler(archive.findBrews));

module.exports = router;
