const express = require('express');
const asyncHandler = require('express-async-handler');
const HomebrewModel = require('./homebrew.model.js').model;

const router = express.Router();

const buildTitleConditions = (title) => {
    if (!title) return {};
    return {
        $text: {
            $search: title,
            $caseSensitive: false,
        },
    };
};

const buildAuthorConditions = (author) => {
    if (!author) return {};
    return { authors: author };
};

//"$and": [ {"published": true}, {"$text": { "$search": "titleString", "$caseSensitive": false } }, { "authors" : "authorString"}] 
//is a good example of a query constructed with this function

const handleErrorResponse = (res, error, functionName) => {
    const status = error.response?.status || 500;
    const message =
        status === 503 ? 'Service Unavailable' : 'Internal Server Error';

    console.error(`Error in ${functionName}:`, error);

    return res.status(status).json({
        errorCode: status.toString(),
        message: `Error in function ${functionName}: ${message}`,
    });
};

const buildBrewsQuery = (legacy, v3) => {
    if (legacy === 'true' && v3 === 'true') return { published: true };

    const renderers = [];
    if (legacy === 'true') renderers.push('legacy');
    if (v3 === 'true') renderers.push('V3');

    const brewsQuery = { published: true };
    if (renderers.length > 0) brewsQuery.renderer = { $in: renderers };

    return brewsQuery;
};

const vault = {
    findBrews: async (req, res) => {
        try {
            console.log(`Query as received in vault api for findBrews:`);
            console.table(req.query);

            const title = req.query.title || '';
            const author = req.query.author || '';
           
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const mincount = 10;
            const count = Math.max(parseInt(req.query.count) || 20, mincount);
            const skip = (page - 1) * count;

            const brewsQuery = buildBrewsQuery(req.query.legacy, req.query.v3);
            const titleConditions = buildTitleConditions(title);
            const authorConditions = buildAuthorConditions(author);

            const combinedQuery = {
                $and: [brewsQuery, titleConditions, authorConditions],
            };

            const projection = {
                editId: 0,
                googleId: 0,
                text: 0,
                textBin: 0,
            };
            const brews = await HomebrewModel.find(combinedQuery, projection)
                .skip(skip)
                .limit(count)
                .maxTimeMS(5000)
                .exec();

            console.log('query', JSON.stringify(combinedQuery, null, 2));
            return res.json({ brews, page });
        } catch (error) {
            console.error(error);
            return handleErrorResponse(res, error, 'findBrews');
        }
    },

    findTotal: async (req, res) => {
        console.log(`Query as received in vault api for totalBrews:`);
        console.table(req.query);
        try {
            const title = req.query.title || '';
            const author = req.query.author || '';

            const brewsQuery = buildBrewsQuery(req.query.legacy, req.query.v3);
            const titleConditions = buildTitleConditions(title);
            const authorConditions = buildAuthorConditions(author);

            const combinedQuery = {
                $and: [brewsQuery, titleConditions, authorConditions],
            };

            console.log(
                'Combined Query:',
                JSON.stringify(combinedQuery, null, 2)
            );

            const totalBrews = await HomebrewModel.countDocuments(
                combinedQuery
            );
            console.log(
                'when returning, totalbrews is ',
                totalBrews,
                'for the query',
                JSON.stringify(combinedQuery)
            );
            return res.json({ totalBrews });
        } catch (error) {
            console.error(error);
            return handleErrorResponse(res, error, 'findTotal');
        }
    },
};

router.get('/api/vault/total', asyncHandler(vault.findTotal));
router.get('/api/vault', asyncHandler(vault.findBrews));

module.exports = router;
