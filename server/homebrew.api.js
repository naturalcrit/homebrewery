const _ = require('lodash');
const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();

// const getTopBrews = (cb)=>{
// 	HomebrewModel.find().sort({ views: -1 }).limit(5).exec(function(err, brews) {
// 		cb(brews);
// 	});
// };

const getGoodBrewTitle = (text)=>{
	const titlePos = text.indexOf('# ');
	if(titlePos !== -1){
		const ending = text.indexOf('\n', titlePos);
		return text.substring(titlePos + 2, ending);
	} else {
		return _.find(text.split('\n'), (line)=>{
			return line;
		});
	}
};



router.post('/api', (req, res)=>{

	let authors = [];
	if(req.account) authors = [req.account.username];

	const newHomebrew = new HomebrewModel(_.merge({},
		req.body,
		{ authors: authors }
	));
	if(!newHomebrew.title){
		newHomebrew.title = getGoodBrewTitle(newHomebrew.text);
	}
	newHomebrew.save((err, obj)=>{
		if(err){
			console.error(err, err.toString(), err.stack);
			return res.status(500).send(`Error while creating new brew, ${err.toString()}`);
		}
		return res.json(obj);
	});
});

router.put('/api/update/:id', (req, res)=>{
	HomebrewModel.get({ editId: req.params.id })
		.then((brew)=>{
			brew = _.merge(brew, req.body);
			brew.updatedAt = new Date();
			if(req.account) brew.authors = _.uniq(_.concat(brew.authors, req.account.username));

			brew.markModified('authors');
			brew.markModified('systems');

			brew.save((err, obj)=>{
				if(err) throw err;
				return res.status(200).send(obj);
			});
		})
		.catch((err)=>{
			console.log(err);
			return res.status(500).send('Error while saving');
		});
});

router.get('/api/remove/:id', (req, res)=>{
	HomebrewModel.find({ editId: req.params.id }, (err, objs)=>{
		if(!objs.length || err) return res.status(404).send('Can not find homebrew with that id');
		const brew = objs[0];

		// Remove current user as author
		if(req.account){
			brew.authors = _.pull(brew.authors, req.account.username);
			brew.markModified('authors');
		}

		// Delete brew if there are no authors left
		if(!brew.authors.length)
			brew.remove((err)=>{
				if(err) return res.status(500).send('Error while removing');
				return res.status(200).send();
			});
		// Otherwise, save the brew with updated author list
		else
			brew.save((err, savedBrew)=>{
				if(err) throw err;
				return res.status(200).send(savedBrew);
			});
	});
});


module.exports = router;

/*



module.exports = function(app){

	app;




	app.get('/api/search', mw.adminOnly, function(req, res){

		var page = req.query.page || 0;
		var count = req.query.count || 20;

		var query = {};
		if(req.query && req.query.id){
			query = {
				"$or" : [{
					editId : req.query.id
				},{
					shareId : req.query.id
				}]
			};
		}

		HomebrewModel.find(query, {
			text : 0 //omit the text
		}, {
			skip: page*count,
			limit: count*1
		}, function(err, objs){
			if(err) console.log(err);
			return res.json({
				page : page,
				count : count,
				total : homebrewTotal,
				brews : objs
			});

		});
	})




	return app;
}
*/
