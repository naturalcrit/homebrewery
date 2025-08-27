import express    from 'express';
import asyncHandler from 'express-async-handler';
import { model as HomebrewModel }     from './homebrew.model.js';

const router = express.Router();

const titleConditions = (title)=>{
	if(!title) return {};
	return {
		$text : {
			$search        : title,
			$caseSensitive : false,
		},
	};
};

const authorConditions = (author)=>{
	if(!author) return {};
	return { authors: author };
};

const rendererConditions = (legacy, v3)=>{
	if(legacy === 'true' && v3 !== 'true')
		return { renderer: 'legacy' };

	if(v3 === 'true' && legacy !== 'true')
		return { renderer: 'V3' };

	return {}; // If all renderers selected, renderer field not needed in query for speed
};

const sortConditions = (sort, dir)=>{
	return { [sort]: dir === 'asc' ? 1 : -1 };
};

const findBrews = async (req, res)=>{
	const title  = req.query.title || '';
	const author = req.query.author || '';
	const page   = Math.max(parseInt(req.query.page)  || 1, 1);
	const count  = Math.max(parseInt(req.query.count) || 20, 10);
	const skip   = (page - 1) * count;
	const sort = req.query.sort || 'title';
	const dir = req.query.dir || 'asc';

	const combinedQuery = {
		$and : [
			{ published: true },
			rendererConditions(req.query.legacy, req.query.v3),
			titleConditions(title),
			authorConditions(author)
		],
	};

	const projection = {
		editId   : 0,
		googleId : 0,
		text     : 0,
		textBin  : 0,
		version  : 0
	};

	await HomebrewModel.find(combinedQuery, projection)
		.sort(sortConditions(sort, dir))
		.skip(skip)
		.limit(count)
		.maxTimeMS(5000)
		.exec()
		.then((brews)=>{
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			const processedBrews = brews.map((brew)=>{
				brew.authors = brew.authors.map((author)=>emailRegex.test(author) ? 'hidden' : author
				);
				return brew;
			});
			res.json({ brews: processedBrews, page });
		})
		.catch((error)=>{
			throw { ...error, message: 'Error finding brews in Vault search', HBErrorCode: 90 };
		});
};

const findTotal = async (req, res)=>{
	const title  = req.query.title || '';
	const author = req.query.author || '';

	const combinedQuery = {
		$and : [
			{ published: true },
			rendererConditions(req.query.legacy, req.query.v3),
			titleConditions(title),
			authorConditions(author)
		],
	};

	await HomebrewModel.countDocuments(combinedQuery)
		.then((totalBrews)=>{
			console.log(`when returning, the total of brews is ${totalBrews} for the query ${JSON.stringify(combinedQuery)}`);
			res.json({ totalBrews });
		})
		.catch((error)=>{
			throw { ...error, message: 'Error finding brews in Vault search findTotal function', HBErrorCode: 91 };
		});
};

router.get('/api/vault/total', asyncHandler(findTotal));
router.get('/api/vault', asyncHandler(findBrews));

export default router;
