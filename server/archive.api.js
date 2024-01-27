const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const asyncHandler = require('express-async-handler');

const archive = {
    archiveApi: router,
    /* Searches for matching title, also attempts to partial match */
    findBrews: async (req, res, next) => {
        try {
            const limit = 3000;
            const brews = await HomebrewModel.find({
                title: { $regex: req.params.query, $options: 'i' },
                published: true
            })
            .limit(limit)
            .exec();

            const simplifiedBrews = brews.map(brew => ({
                title           : brew.title,
                description     : brew.description,
                authors         : brew.authors,
                invitedauthors  : brew.invitedauthors,
                tags            : brew.tags,
                pageCount       : brew.pageCount,
                systems         : brew.systems,
                renderer        : brew.renderer,
                thumbnail       : brew.thumbnail,
                createdAt       : brew.createdAt,
                updatedAt       : brew.updatedAt,
                lastViewed      : brew.lastViewed,
                views           : brew.views,
                shareId         : brew.shareId,
                googleId        : brew.googleId
            }))

            if (!simplifiedBrews || simplifiedBrews.length === 0) {
                // No published documents found with the given title
                return res.status(404).json({ error: 'Published documents not found' });
            }

            let message = '';
            if (simplifiedBrews.length === limit) {
                // If the limit has been reached, include a message in the response
                message = `You've reached the limit of ${limit} documents, you can try being more specific in your search.`;
            }

            return res.json({ simplifiedBrews, message });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

router.get('/archive/:query', asyncHandler(archive.findBrews));

module.exports = router;
