const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const asyncHandler = require('express-async-handler');

const archive = {
    /* Searches for matching title, also attempts to partial match */
    findBrews: async (req, res, next) => {
        try {
            console.log(`Query as received in archive api:`);
            console.table(req.query);

            const title = req.query.title || '';
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const minPageSize = 6;
            const pageSize = Math.max(
                parseInt(req.query.size) || 10,
                minPageSize
            );
            const timeout = 5000;

            // Define the aggregation pipeline
            const pipeline = [
                // Match stage to filter brews based on searchText using $search
                title
                    ? {
                          $search: {
                              text: {
                                  query: title,
                                  path: ['title_text'], // Fields to search
                              },
                          },
                      }
                    : null,

                // Count stage to get the total number of brews
                { $count: 'totalCount' },

                // Skip and limit stage for pagination
                { $skip: (page - 1) * pageSize },
                { $limit: pageSize },

                // Project stage to shape the output
                {
                    $project: {
                        //page size and page are like a table tennis ball, from jsx to api back to jsx without changes, maybe i can avoid that
                        metadata: { totalCount: '$totalCount', page, pageSize },
                        brews: 1,
                    },
                },
            ].filter(Boolean);

            console.log('Aggregation Pipeline:', pipeline);

            // Execute the aggregation pipeline
            const result = await HomebrewModel.aggregate(pipeline);

            console.log('Aggregation Result:', result);

            // Extract the result
            const brews = result[0] ? result[0].data : [];
            const totalBrews = result[0] ? result[0].metadata.totalCount : 0;

            return response.status(200).json({
                success: true,
                brews: {
                    metadata: { totalBrews, page, pageSize },
                    brewCollection: brews,
                },
            });
        } catch (error) {
            console.error(error);

            if (error.response && error.response.status) {
                const status = error.response.status;

                if (status === 500) {
                    return res.status(500).json({
                        errorCode: '500',
                        message: 'Internal Server Error',
                        log: error,
                    });
                } else if (status === 503) {
                    return res.status(503).json({
                        errorCode: '503',
                        message: 'Service Unavailable',
                        log: error,
                    });
                } else {
                    return res.status(status).json({
                        errorCode: status.toString(),
                        message: 'Internal Server Error',
                        log: error,
                    });
                }
            } else {
                console.log('what issue is this?' , error);
                return error
            }
        }
    },
};

router.get('/api/archive', asyncHandler(archive.findBrews));

module.exports = router;
