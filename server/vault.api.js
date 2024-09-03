const express = require('express');
const asyncHandler = require('express-async-handler');
const HomebrewModel = require('./homebrew.model.js').model;

const router = express.Router();

const titleConditions = (title) => {
	if (!title) return {};
	return {
		$text: {
			$search: title,
			$caseSensitive: false,
		},
	};
};

const authorConditions = (author) => {
	if (!author) return {};
	return { authors: author };
};

const rendererConditions = (legacy, v3) => {
	const renderer = {};

	if (legacy === 'true' && v3 !== 'true') {
		renderer.renderer = 'legacy';
	} else if (v3 === 'true' && legacy !== 'true') {
		renderer.renderer = 'V3';
	}

    //if all renderers are selected, doesn't make sense to add them to the query, it would only take longer
	return renderer;
};

const findBrews = async (req, res) => {
	const title = req.query.title || '';
	const author = req.query.author || '';
	const page = Math.max(parseInt(req.query.page) || 1, 1);
	const mincount = 10;
	const count = Math.max(parseInt(req.query.count) || 20, mincount);
	const skip = (page - 1) * count;

	const rendererQuery = rendererConditions(req.query.legacy, req.query.v3);
	const titleQuery = titleConditions(title);
	const authorQuery = authorConditions(author);

	const combinedQuery = {
		$and: [
			{ published: true },
			rendererQuery,
			titleQuery,
			authorQuery,
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
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			const processedBrews = brews.map((brew) => {
				brew.authors = brew.authors.map(author =>
					emailRegex.test(author) ? 'hidden' : author
				);
				return brew;
			});
			res.json({ brews: processedBrews, page });
		})
		.catch((error) => {
			console.error(error);
			throw {...err, message: "Error finding brews in Vault search", HBErrorCode: 90}; 
		});
};

const findTotal = async (req, res) => {
	const title = req.query.title || '';
	const author = req.query.author || '';

	const rendererQuery = rendererConditions(req.query.legacy, req.query.v3);
	const titleQuery = titleConditions(title);
	const authorQuery = authorConditions(author);

	const combinedQuery = {
		$and: [
			{ published: true },
			rendererQuery,
			titleQuery,
			authorQuery,
		],
	};

	await HomebrewModel.countDocuments(combinedQuery)
		.then((totalBrews) => {
			console.log(`when returning, the total of brews is ${totalBrews} for the query ${JSON.stringify(combinedQuery)}`); 
			res.json({ totalBrews });
		})
		.catch((error) => {
			console.error(error);
			throw {...err, message: "Error finding brews in Vault search findTotal function", HBErrorCode: 91};
		});
};

router.get('/api/vault/total', asyncHandler(findTotal));
router.get('/api/vault', asyncHandler(findBrews));

module.exports = router;
