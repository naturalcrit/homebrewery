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

const buildRendererConditions = (legacy, v3) => {
	const brewsQuery = {};

	if (legacy === 'true' && v3 !== 'true') {
		brewsQuery.renderer = 'legacy';
	} else if (v3 === 'true' && legacy !== 'true') {
		brewsQuery.renderer = 'V3';
	}

	return brewsQuery;
};

// Function to find brews
const findBrews = async (req, res) => {
	const title = req.query.title || '';
	const author = req.query.author || '';
	const page = Math.max(parseInt(req.query.page) || 1, 1);
	const mincount = 10;
	const count = Math.max(parseInt(req.query.count) || 20, mincount);
	const skip = (page - 1) * count;

	const brewsQuery = buildRendererConditions(req.query.legacy, req.query.v3);
	const titleConditions = buildTitleConditions(title);
	const authorConditions = buildAuthorConditions(author);

	const combinedQuery = {
		$and: [
			{ published: true },
			brewsQuery,
			titleConditions,
			authorConditions,
		],
	};

	const projection = {
		editId: 0,
		googleId: 0,
		text: 0,
		textBin: 0,
		version: 0,
		thumbnail: 0,
	};

	await HomebrewModel.find(combinedQuery, projection)
		.skip(skip)
		.limit(count)
		.maxTimeMS(5000)
		.exec()
		.then((brews) => {
			console.log(
				'Query in findBrews: ',
				JSON.stringify(combinedQuery, null, 2)
			);
			res.json({ brews, page });
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json({
				error: 'Error finding brews in Vault search',
				HBErrorCode: '99',
			});
		});
};

// Function to find total brews
const findTotal = async (req, res) => {
	const title = req.query.title || '';
	const author = req.query.author || '';

	const brewsQuery = buildRendererConditions(req.query.legacy, req.query.v3);
	const titleConditions = buildTitleConditions(title);
	const authorConditions = buildAuthorConditions(author);

	const combinedQuery = {
		$and: [
			{ published: true },
			brewsQuery,
			titleConditions,
			authorConditions,
		],
	};

	await HomebrewModel.countDocuments(combinedQuery)
		.then((totalBrews) => {
			console.log(
				'when returning, the total of brews is ',
				totalBrews,
				'for the query',
				JSON.stringify(combinedQuery)
			);
			res.json({ totalBrews });
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json({
				error: 'Error finding brews in Vault search find total search',
				HBErrorCode: '99',
			});
		});
};

router.get('/api/vault/total', asyncHandler(findTotal));
router.get('/api/vault', asyncHandler(findBrews));

module.exports = router;
