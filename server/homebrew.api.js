var _ = require('lodash');
var Moment = require('moment');
var HomebrewModel = require('./homebrew.model.js').model;

var changelogText = require('fs').readFileSync('./changelog.md', 'utf8');


var getTopBrews = function(cb){
	HomebrewModel.find().sort({views: -1}).limit(5).exec(function(err, brews) {
		cb(brews);
	});
}



module.exports = function(app){

	app.get('/homebrew/top', function(req, res){
		getTopBrews(function(topBrews){
			return res.json(topBrews);
		});
	})

	//Updating
	app.put('/homebrew/update/:id', function(req, res){
		HomebrewModel.find({editId : req.params.id}, function(err, objs){
			if(!objs.length || err) return res.status(404).send("Can not find homebrew with that id");
			var resEntry = objs[0];
			resEntry.text = req.body.text;
			resEntry.updatedAt = new Date();
			resEntry.save(function(err, obj){
				if(err) return res.status(500).send("Error while saving");
				return res.status(200).send(obj);
			})
		});
	});

	app.get('/homebrew/remove/:id', function(req, res){
		//if(req.query && req.query.admin_key == process.env.ADMIN_KEY){
			HomebrewModel.find({editId : req.params.id}, function(err, objs){
				console.log(err);
				if(!objs.length || err) return res.status(404).send("Can not find homebrew with that id");
				var resEntry = objs[0];
				resEntry.remove(function(err){
					if(err) return res.status(500).send("Error while removing");
					return res.status(200).send();
				})
			});
		//}else{
		//	return res.status(401).send('Access denied');
		//}
	});

	//Removes all empty brews that are older than 3 days
	app.get('/homebrew/clear_old', function(req, res){
		if(req.query && req.query.admin_key == process.env.ADMIN_KEY){
			HomebrewModel.remove({
				text : '',
				createdAt: {
					$lt: Moment().subtract(3, 'days').toDate()
				}
			}, function(err, objs){
				return res.status(200).send();
			});
		}else{
			return res.status(401).send('Access denied');
		}
	});



	return app;
}