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
            const skip = (page - 1) * pageSize;

            const brewsQuery = {
                $or: [],
                published: true,
            };

            if (req.query.legacy === 'true') {
                brewsQuery.$or.push({ renderer: 'legacy' });
            }

            if (req.query.v3 === 'true') {
                brewsQuery.$or.push({ renderer: 'V3' });
            }

            // If user wants to use RegEx it needs to format like /text/
            const titleConditionsArray =
                title.startsWith('/') && title.endsWith('/')
                    ? [
                          {
                              'title': {
                                  $regex: title.slice(1, -1),
                                  $options: 'i',
                              },
                          },
                      ]
                    : buildTitleConditions(title);

            function buildTitleConditions(inputString) {
                return [
                    {
                        $text: {
                            $search: inputString,
                            $caseSensitive: false,
                        },
                    },
                ];
            }

            const titleQuery = {
                $and: [brewsQuery, ...titleConditionsArray],
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

            return res.json({ brews, page});

        } catch (error) {
            console.error(error);

            if (error.response && error.response.status) {
                const status = error.response.status;

                if (status === 500) {
                    return res.status(500).json({
                        errorCode: '500',
                        message: 'Internal Server Error',
                    });
                } else if (status === 503) {
                    return res.status(503).json({
                        errorCode: '503',
                        message: 'Service Unavailable',
                    });
                } else {
                    return res.status(status).json({
                        errorCode: status.toString(),
                        message: 'Internal Server Error',
                    });
                }
            } else {
                return res.status(500).json({
                    errorCode: '500',
                    message: 'Internal Server Error',
                });
            }
        }
    },
    findTotal: async (req, res) => {
        try {
            const title = req.query.title || '';

            const brewsQuery = {
                $or: [],
                published: true,
            };
            if (req.query.legacy === 'true') {
                brewsQuery.$or.push({ renderer: 'legacy' });
            }
            if (req.query.v3 === 'true') {
                brewsQuery.$or.push({ renderer: 'V3' });
            }
            // If user wants to use RegEx it needs to format like /text/
            const titleConditionsArray =
                title.startsWith('/') && title.endsWith('/')
                    ? [
                          {
                              'title': {
                                  $regex: title.slice(1, -1),
                                  $options: 'i',
                              },
                          },
                      ]
                    : buildTitleConditions(title);

            function buildTitleConditions(inputString) {
                return [
                    {
                        $text: {
                            $search: inputString,
                            $caseSensitive: false,
                        },
                    },
                ];
            }
            const titleQuery = {
                $and: [brewsQuery, ...titleConditionsArray],
            };
            console.table(req.query);

            const totalBrews = await HomebrewModel.countDocuments(titleQuery);

            return res.json({totalBrews});

        } catch (error) {
            console.error(error);

            if (error.response && error.response.status) {
                const status = error.response.status;

                if (status === 500) {
                    return res.status(500).json({
                        errorCode: '500',
                        message: 'Internal Server Error',
                    });
                } else if (status === 503) {
                    return res.status(503).json({
                        errorCode: '503',
                        message: 'Service Unavailable',
                    });
                } else {
                    return res.status(status).json({
                        errorCode: status.toString(),
                        message: 'Internal Server Error',
                    });
                }
            } else {
                return res.status(500).json({
                    errorCode: '500',
                    message: 'Internal Server Error',
                });
            }
        }
    },
};

router.get('/api/archive/total', asyncHandler(archive.findTotal));
router.get('/api/archive', asyncHandler(archive.findBrews));

module.exports = router;
